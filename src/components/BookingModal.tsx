import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Phone, User, FileText, Loader2 } from "lucide-react";
import { bookingsAPI } from "@/services/api";
import { toast } from "sonner";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facility: {
    id: string;
    name: string;
    consultationFee?: number;
  };
  language: 'en' | 'sw';
  onBookingCreated: (booking: any) => void;
}

export function BookingModal({
  open,
  onOpenChange,
  facility,
  language,
  onBookingCreated,
}: BookingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: "",
    patientPhone: "",
    appointmentDate: "",
    appointmentTime: "",
    symptoms: "",
  });

  const content = {
    en: {
      title: "Book Appointment",
      description: `Schedule a consultation at ${facility.name}`,
      consultationFee: "Consultation Fee",
      patientName: "Full Name",
      patientNamePlaceholder: "Enter your full name",
      patientPhone: "Phone Number",
      patientPhonePlaceholder: "e.g., 0712345678",
      appointmentDate: "Appointment Date",
      appointmentTime: "Preferred Time",
      symptoms: "Symptoms / Reason for Visit",
      symptomsPlaceholder: "Describe your symptoms or reason for consultation...",
      cancel: "Cancel",
      bookNow: "Book Appointment",
      booking: "Booking...",
      successTitle: "Booking Successful!",
      successMessage: "Your appointment has been booked. You can now proceed to payment.",
      errorTitle: "Booking Failed",
      errorMessage: "Failed to create booking. Please try again.",
      phoneHint: "M-Pesa number for payment",
    },
    sw: {
      title: "Ratiba Miadi",
      description: `Panga mahojiano katika ${facility.name}`,
      consultationFee: "Ada ya Mahojiano",
      patientName: "Jina Kamili",
      patientNamePlaceholder: "Ingiza jina lako kamili",
      patientPhone: "Namba ya Simu",
      patientPhonePlaceholder: "mfano, 0712345678",
      appointmentDate: "Tarehe ya Miadi",
      appointmentTime: "Wakati Unaofaa",
      symptoms: "Dalili / Sababu ya Kuja",
      symptomsPlaceholder: "Eleza dalili zako au sababu ya mahojiano...",
      cancel: "Ghairi",
      bookNow: "Ratiba Miadi",
      booking: "Inaratiba...",
      successTitle: "Imeratibwa!",
      successMessage: "Miadi yako imeratibwa. Unaweza kuendelea kulipa.",
      errorTitle: "Imesha kuratiba",
      errorMessage: "Imeshindwa kuratiba. Tafadhali jaribu tena.",
      phoneHint: "Namba ya M-Pesa kwa malipo",
    },
  };

  const t = content[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await bookingsAPI.create({
        facilityId: facility.id,
        ...formData,
      });

      toast.success(t.successTitle, {
        description: t.successMessage,
      });

      // Pass booking to parent for payment processing
      onBookingCreated(response.booking);

      // Reset form
      setFormData({
        patientName: "",
        patientPhone: "",
        appointmentDate: "",
        appointmentTime: "",
        symptoms: "",
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(t.errorTitle, {
        description: error.message || t.errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        {facility.consultationFee && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t.consultationFee}:</span>
              <span className="text-lg font-bold text-primary">
                KES {facility.consultationFee.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Patient Name */}
          <div className="space-y-2">
            <Label htmlFor="patientName" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {t.patientName}
            </Label>
            <Input
              id="patientName"
              value={formData.patientName}
              onChange={(e) => handleInputChange('patientName', e.target.value)}
              placeholder={t.patientNamePlaceholder}
              required
              disabled={isLoading}
            />
          </div>

          {/* Patient Phone */}
          <div className="space-y-2">
            <Label htmlFor="patientPhone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {t.patientPhone}
            </Label>
            <Input
              id="patientPhone"
              type="tel"
              value={formData.patientPhone}
              onChange={(e) => handleInputChange('patientPhone', e.target.value)}
              placeholder={t.patientPhonePlaceholder}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">{t.phoneHint}</p>
          </div>

          {/* Appointment Date */}
          <div className="space-y-2">
            <Label htmlFor="appointmentDate" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t.appointmentDate}
            </Label>
            <Input
              id="appointmentDate"
              type="date"
              value={formData.appointmentDate}
              onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
              min={today}
              required
              disabled={isLoading}
            />
          </div>

          {/* Appointment Time */}
          <div className="space-y-2">
            <Label htmlFor="appointmentTime" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t.appointmentTime}
            </Label>
            <Input
              id="appointmentTime"
              type="time"
              value={formData.appointmentTime}
              onChange={(e) => handleInputChange('appointmentTime', e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* Symptoms */}
          <div className="space-y-2">
            <Label htmlFor="symptoms" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {t.symptoms}
            </Label>
            <Textarea
              id="symptoms"
              value={formData.symptoms}
              onChange={(e) => handleInputChange('symptoms', e.target.value)}
              placeholder={t.symptomsPlaceholder}
              rows={4}
              required
              disabled={isLoading}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1"
            >
              {t.cancel}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t.booking}
                </>
              ) : (
                t.bookNow
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
