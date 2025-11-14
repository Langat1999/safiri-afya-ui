import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * M-Pesa Daraja API Service
 * Handles STK Push, callbacks, and revenue splitting
 */

class MpesaService {
  constructor() {
    this.environment = process.env.MPESA_ENVIRONMENT || 'sandbox';
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.shortcode = process.env.MPESA_SHORTCODE || '174379';
    this.passkey = process.env.MPESA_PASSKEY;
    this.callbackUrl = process.env.MPESA_CALLBACK_URL;
    this.developerNumber = process.env.DEVELOPER_MPESA_NUMBER;
    this.developerCommission = parseFloat(process.env.DEVELOPER_COMMISSION_PERCENTAGE || 15);

    // API URLs
    this.baseUrl = this.environment === 'sandbox'
      ? 'https://sandbox.safaricom.co.ke'
      : 'https://api.safaricom.co.ke';

    this.authUrl = `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`;
    this.stkPushUrl = `${this.baseUrl}/mpesa/stkpush/v1/processrequest`;
    this.b2cUrl = `${this.baseUrl}/mpesa/b2c/v1/paymentrequest`;

    // Token cache
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get OAuth access token from M-Pesa
   */
  async getAccessToken() {
    try {
      // Return cached token if still valid
      if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
        return this.accessToken;
      }

      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');

      const response = await axios.get(this.authUrl, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });

      this.accessToken = response.data.access_token;
      // Token expires in 1 hour, cache for 55 minutes
      this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000);

      return this.accessToken;
    } catch (error) {
      console.error('M-Pesa Auth Error:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with M-Pesa');
    }
  }

  /**
   * Format phone number to required format (254XXXXXXXXX)
   */
  formatPhoneNumber(phone) {
    // Remove any spaces, dashes, or plus signs
    let cleaned = phone.replace(/[\s\-+]/g, '');

    // If starts with 0, replace with 254
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    }

    // If doesn't start with 254, add it
    if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }

    return cleaned;
  }

  /**
   * Generate timestamp for M-Pesa (YYYYMMDDHHmmss)
   */
  generateTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hour}${minute}${second}`;
  }

  /**
   * Generate password for STK Push
   */
  generatePassword(timestamp) {
    const data = `${this.shortcode}${this.passkey}${timestamp}`;
    return Buffer.from(data).toString('base64');
  }

  /**
   * Calculate revenue split amounts
   */
  calculateRevenueSplit(totalAmount) {
    const developerAmount = Math.round(totalAmount * (this.developerCommission / 100));
    const hospitalAmount = totalAmount - developerAmount;

    return {
      total: totalAmount,
      developerAmount,
      hospitalAmount,
      developerPercentage: this.developerCommission,
      hospitalPercentage: 100 - this.developerCommission,
    };
  }

  /**
   * Initiate STK Push for consultation payment
   * @param {string} phoneNumber - Customer phone number
   * @param {number} amount - Total consultation fee
   * @param {string} accountReference - Booking/Hospital reference
   * @param {string} transactionDesc - Description
   */
  async initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc = 'Consultation Fee') {
    try {
      const token = await this.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      const requestData = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount), // M-Pesa requires integer amounts
        PartyA: formattedPhone,
        PartyB: this.shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: this.callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc,
      };

      console.log('STK Push Request:', {
        ...requestData,
        Password: '[REDACTED]',
      });

      const response = await axios.post(this.stkPushUrl, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        success: true,
        checkoutRequestId: response.data.CheckoutRequestID,
        merchantRequestId: response.data.MerchantRequestID,
        responseCode: response.data.ResponseCode,
        responseDescription: response.data.ResponseDescription,
        customerMessage: response.data.CustomerMessage,
      };
    } catch (error) {
      console.error('STK Push Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.errorMessage || 'Failed to initiate M-Pesa payment');
    }
  }

  /**
   * Process B2C payment (sending money to hospital and developer)
   * Note: B2C requires additional setup and may not work in sandbox without approval
   */
  async processB2CPayment(recipientPhone, amount, remarks = 'Consultation Payment') {
    try {
      const token = await this.getAccessToken();
      const formattedPhone = this.formatPhoneNumber(recipientPhone);

      const requestData = {
        InitiatorName: process.env.MPESA_INITIATOR_NAME,
        SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
        CommandID: 'BusinessPayment',
        Amount: Math.round(amount),
        PartyA: this.shortcode,
        PartyB: formattedPhone,
        Remarks: remarks,
        QueueTimeOutURL: process.env.MPESA_RESULT_URL,
        ResultURL: process.env.MPESA_RESULT_URL,
        Occasion: 'Consultation Fee Split',
      };

      const response = await axios.post(this.b2cUrl, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        success: true,
        conversationId: response.data.ConversationID,
        originatorConversationId: response.data.OriginatorConversationID,
        responseCode: response.data.ResponseCode,
        responseDescription: response.data.ResponseDescription,
      };
    } catch (error) {
      console.error('B2C Payment Error:', error.response?.data || error.message);
      // Don't throw - log and continue, as B2C might not work in sandbox
      return {
        success: false,
        error: error.response?.data?.errorMessage || 'B2C payment failed',
      };
    }
  }

  /**
   * Process revenue split after successful payment
   * In production, this would trigger two B2C transactions
   * In sandbox/demo, we just log the split
   */
  async processRevenueSplit(totalAmount, hospitalPhone, transactionId) {
    const split = this.calculateRevenueSplit(totalAmount);

    console.log('Revenue Split:', {
      transactionId,
      total: split.total,
      developer: {
        amount: split.developerAmount,
        percentage: split.developerPercentage,
        phone: this.developerNumber,
      },
      hospital: {
        amount: split.hospitalAmount,
        percentage: split.hospitalPercentage,
        phone: hospitalPhone,
      },
    });

    // In production with approved B2C:
    // 1. Send split.developerAmount to this.developerNumber
    // 2. Send split.hospitalAmount to hospitalPhone

    // For now, we'll attempt B2C but won't fail if it doesn't work in sandbox
    const results = {
      split,
      developerPayment: null,
      hospitalPayment: null,
    };

    // Attempt to send to developer
    try {
      results.developerPayment = await this.processB2CPayment(
        this.developerNumber,
        split.developerAmount,
        `Developer Commission - ${transactionId}`
      );
    } catch (error) {
      console.warn('Developer B2C failed (expected in sandbox):', error.message);
    }

    // Attempt to send to hospital
    try {
      results.hospitalPayment = await this.processB2CPayment(
        hospitalPhone,
        split.hospitalAmount,
        `Consultation Fee - ${transactionId}`
      );
    } catch (error) {
      console.warn('Hospital B2C failed (expected in sandbox):', error.message);
    }

    return results;
  }
}

// Export singleton instance
export default new MpesaService();
