import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Phone,
  Smartphone,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { paymentsAPI } from "@/services/api";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: {
    id: string;
    facilityName: string;
    consultationFee: number;
    patientPhone: string;
  };
  language: 'en' | 'sw';
  onPaymentSuccess: () => void;
}

type PaymentStatus = 'idle' | 'initiating' | 'pending' | 'completed' | 'failed';

export function PaymentModal({
  open,
  onOpenChange,
  booking,
  language,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [phoneNumber, setPhoneNumber] = useState(booking.patientPhone);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [mpesaReceipt, setMpesaReceipt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const content = {
    en: {
      title: "Pay for Consultation",
      description: "Complete your payment via M-Pesa",
      facility: "Facility",
      amount: "Amount to Pay",
      phoneNumber: "M-Pesa Phone Number",
      phonePlaceholder: "e.g., 0712345678",
      phoneHint: "Enter the M-Pesa number to pay from",
      revenueSplit: "Payment Distribution",
      hospital: "Hospital (85%)",
      developer: "Platform Fee (15%)",
      cancel: "Cancel",
      payNow: "Pay with M-Pesa",
      initiating: "Initiating Payment...",
      checkPhone: "Check Your Phone",
      enterPin: "Enter your M-Pesa PIN to complete the payment",
      processing: "Processing Payment...",
      pleasewait: "Please wait while we confirm your payment",
      success: "Payment Successful!",
      successMessage: "Your consultation has been paid for",
      receipt: "M-Pesa Receipt",
      failed: "Payment Failed",
      failedMessage: "The payment could not be completed",
      tryAgain: "Try Again",
      done: "Done",
    },
    sw: {
      title: "Lipa Mahojiano",
      description: "Maliza malipo yako kupitia M-Pesa",
      facility: "Kituo",
      amount: "Kiasi cha Kulipa",
      phoneNumber: "Namba ya M-Pesa",
      phonePlaceholder: "mfano, 0712345678",
      phoneHint: "Ingiza namba ya M-Pesa ya kulipa",
      revenueSplit: "Usambazaji wa Malipo",
      hospital: "Hospitali (85%)",
      developer: "Ada ya Jukwaa (15%)",
      cancel: "Ghairi",
      payNow: "Lipa na M-Pesa",
      initiating: "Inaanzisha Malipo...",
      checkPhone: "Angalia Simu Yako",
      enterPin: "Ingiza PIN yako ya M-Pesa kukamilisha malipo",
      processing: "Inasindika Malipo...",
      pleasewait: "Tafadhali subiri tunapothibitisha malipo yako",
      success: "Malipo Yamefaulu!",
      successMessage: "Mahojiano yako yamelipwa",
      receipt: "Risiti ya M-Pesa",
      failed: "Malipo Yameshindikana",
      failedMessage: "Malipo hayakuweza kukamilika",
      tryAgain: "Jaribu Tena",
      done: "Imemaliza",
    },
  };

  const t = content[language];

  // Calculate revenue split
  const developerAmount = Math.round(booking.consultationFee * 0.15);
  const hospitalAmount = booking.consultationFee - developerAmount;

  // Poll payment status
  useEffect(() => {
    if (paymentStatus === 'pending' && checkoutRequestId) {
      const interval = setInterval(async () => {
        try {
          const status = await paymentsAPI.getByCheckoutRequestId(checkoutRequestId);

          if (status.status === 'completed') {
            setPaymentStatus('completed');
            setMpesaReceipt(status.mpesaReceiptNumber);
            clearInterval(interval);
            setPollingInterval(null);

            toast.success(t.success, {
              description: t.successMessage,
            });

            setTimeout(() => {
              onPaymentSuccess();
              onOpenChange(false);
            }, 3000);
          } else if (status.status === 'failed') {
            setPaymentStatus('failed');
            setErrorMessage(status.failureReason || t.failedMessage);
            clearInterval(interval);
            setPollingInterval(null);
          }
        } catch (error) {
          console.error('Status polling error:', error);
        }
      }, 3000); // Poll every 3 seconds

      setPollingInterval(interval);

      // Stop polling after 2 minutes
      setTimeout(() => {
        if (interval) {
          clearInterval(interval);
          setPollingInterval(null);
          if (paymentStatus === 'pending') {
            setPaymentStatus('failed');
            setErrorMessage('Payment timeout. Please try again.');
          }
        }
      }, 120000);
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [paymentStatus, checkoutRequestId]);

  const handlePayment = async () => {
    setPaymentStatus('initiating');
    setErrorMessage(null);

    try {
      const response = await paymentsAPI.initiate({
        bookingId: booking.id,
        phoneNumber,
      });

      setPaymentId(response.payment.id);
      setCheckoutRequestId(response.payment.checkoutRequestId);
      setPaymentStatus('pending');

      toast.info(t.checkPhone, {
        description: t.enterPin,
      });
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      setErrorMessage(error.message || t.failedMessage);

      toast.error(t.failed, {
        description: error.message || t.failedMessage,
      });
    }
  };

  const handleTryAgain = () => {
    setPaymentStatus('idle');
    setErrorMessage(null);
    setPaymentId(null);
    setCheckoutRequestId(null);
    setMpesaReceipt(null);
  };

  const handleClose = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            {t.title}
          </DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Booking Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t.facility}:</span>
              <span className="font-medium">{booking.facilityName}</span>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t.amount}:</span>
                <span className="text-2xl font-bold text-primary">
                  KES {booking.consultationFee.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Revenue Split Info */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">
                {t.revenueSplit}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span>{t.hospital}</span>
                <span className="font-medium">KES {hospitalAmount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>{t.developer}</span>
                <span className="font-medium">KES {developerAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Status Screens */}
          {paymentStatus === 'idle' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {t.phoneNumber}
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={t.phonePlaceholder}
                  required
                />
                <p className="text-xs text-muted-foreground">{t.phoneHint}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  {t.cancel}
                </Button>
                <Button
                  onClick={handlePayment}
                  className="flex-1"
                  disabled={!phoneNumber}
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  {t.payNow}
                </Button>
              </div>
            </>
          )}

          {paymentStatus === 'initiating' && (
            <div className="text-center py-8 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
              <p className="font-medium">{t.initiating}</p>
            </div>
          )}

          {paymentStatus === 'pending' && (
            <div className="space-y-4">
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold">{t.checkPhone}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t.enterPin}
                  </p>
                </AlertDescription>
              </Alert>

              <div className="text-center py-6 space-y-4">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                <div>
                  <p className="font-medium">{t.processing}</p>
                  <p className="text-sm text-muted-foreground">{t.pleasewait}</p>
                </div>
              </div>
            </div>
          )}

          {paymentStatus === 'completed' && (
            <div className="text-center py-8 space-y-4">
              <CheckCircle2 className="w-16 h-16 mx-auto text-green-500" />
              <div>
                <p className="text-lg font-semibold text-green-600">{t.success}</p>
                <p className="text-sm text-muted-foreground">{t.successMessage}</p>
              </div>
              {mpesaReceipt && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-700 font-medium">{t.receipt}</p>
                  <p className="text-sm font-mono font-semibold text-green-800">
                    {mpesaReceipt}
                  </p>
                </div>
              )}
              <Button onClick={handleClose} className="w-full">
                {t.done}
              </Button>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold">{t.failed}</p>
                  <p className="text-sm mt-1">
                    {errorMessage || t.failedMessage}
                  </p>
                </AlertDescription>
              </Alert>

              <div className="text-center py-6">
                <XCircle className="w-16 h-16 mx-auto text-destructive opacity-50" />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  {t.cancel}
                </Button>
                <Button
                  onClick={handleTryAgain}
                  className="flex-1"
                >
                  {t.tryAgain}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
