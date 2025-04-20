"use client";

import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  GymResource,
  TimeSlot,
  bookTimeSlot,
  getAvailableTimeSlots,
  getGymResources,
} from "@/services/gym-resource";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { z } from "zod";

const bookingFormSchema = z.object({
  gymResourceId: z.string({
    required_error: "Please select a gym resource to book.",
  }),
  selectedTimeSlot: z.string({
    required_error: "Please select a time slot to book.",
  }),
  date: z.date({
    required_error: "Please select a date.",
  }),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export default function Home() {
  const [gymResources, setGymResources] = useState<GymResource[] | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<
    TimeSlot[] | null
  >(null);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const { toast } = useToast();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      gymResourceId: "",
      selectedTimeSlot: "",
      date: selectedDate,
    },
  });

  useEffect(() => {
    async function loadResources() {
      const resources = await getGymResources();
      setGymResources(resources);
    }
    loadResources();
  }, []);

  useEffect(() => {
    async function loadTimeSlots() {
      if (!selectedResourceId || !selectedDate) {
        return;
      }
      const timeSlots = await getAvailableTimeSlots(
        selectedResourceId,
        selectedDate.toISOString()
      );
      setAvailableTimeSlots(timeSlots);
      form.setValue("selectedTimeSlot", "", { shouldValidate: false }); // Reset selected time slot
    }
    loadTimeSlots();
  }, [selectedResourceId, selectedDate, form]);

  async function onSubmit(data: BookingFormValues) {
    const { gymResourceId, selectedTimeSlot, date } = data;
    const [startTime, endTime] = selectedTimeSlot.split(" - ");

    const userId = "user-123"; // hardcoded user ID for simplicity

    const isBookingSuccessful = await bookTimeSlot(
      gymResourceId,
      new Date(date.toDateString() + ' ' + startTime).toISOString(),
      new Date(date.toDateString() + ' ' + endTime).toISOString(),
      userId
    );

    if (isBookingSuccessful) {
      toast({
        title: "Booking Confirmed",
        description: `You have successfully booked ${gymResourceId} on ${format(
          date,
          "PPP"
        )} from ${startTime} to ${endTime}.`,
      });
      setAvailableTimeSlots(null);
    } else {
      toast({
        title: "Booking Failed",
        description: "There was an error booking the time slot. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Book Your Gym Time</h1>
      <Separator className="mb-4" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Gym Resource</CardTitle>
              <CardDescription>
                Choose the equipment or area you'd like to book.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="gymResourceId"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Gym Resources</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedResourceId(value);
                        }}
                        defaultValue={field.value}
                      >
                        {gymResources ? (
                          gymResources.map((resource) => (
                            <FormItem key={resource.id} className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value={resource.id} />
                              </FormControl>
                              <FormLabel htmlFor={resource.id}>{resource.name}</FormLabel>
                            </FormItem>
                          ))
                        ) : (
                          <>
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-5 w-20" />
                          </>
                        )}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
              <CardDescription>
                Pick the date you want to book your gym time.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-3">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setSelectedDate(date);
                          }}
                          disabled={(date) =>
                            date < new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select Time Slot</CardTitle>
              <CardDescription>
                Choose an available time slot for your workout.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="selectedTimeSlot"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Available Time Slots</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        {availableTimeSlots ? (
                          availableTimeSlots.map((slot) => (
                            <FormItem key={slot.startTime} className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value={`${new Date(slot.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(slot.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`} disabled={!slot.isAvailable} />
                              </FormControl>
                              <FormLabel htmlFor={slot.startTime}>
                                {new Date(slot.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(slot.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                {!slot.isAvailable && " (Booked)"}
                              </FormLabel>
                            </FormItem>
                          ))
                        ) : (
                          <>
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-5 w-20" />
                          </>
                        )}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit">Book Now</Button>
        </form>
      </Form>
    </div>
  );
}
