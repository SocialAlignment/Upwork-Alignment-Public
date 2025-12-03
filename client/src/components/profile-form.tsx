import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link2, Linkedin, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const formSchema = z.object({
  upworkUrl: z
    .string()
    .url({ message: "Please enter a valid URL." })
    .regex(/upwork\.com/, { message: "Must be an Upwork profile URL." }),
  linkedinUrl: z
    .string()
    .url({ message: "Please enter a valid URL." })
    .regex(/linkedin\.com/, { message: "Must be a LinkedIn profile URL." }),
});

interface ProfileFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  isLoading?: boolean;
}

export function ProfileForm({ onSubmit, isLoading }: ProfileFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      upworkUrl: "",
      linkedinUrl: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-profile-links">
        <div className="grid gap-5">
          <FormField
            control={form.control}
            name="upworkUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">Upwork Profile Link</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                      <Link2 className="w-4 h-4" />
                    </div>
                    <Input 
                      placeholder="https://www.upwork.com/freelancers/..." 
                      className="pl-10 h-12 bg-card border-border focus-visible:ring-primary/20 transition-all duration-200" 
                      {...field} 
                      data-testid="input-upwork-url"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="linkedinUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">LinkedIn Profile Link</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </div>
                    <Input 
                      placeholder="https://www.linkedin.com/in/..." 
                      className="pl-10 h-12 bg-card border-border focus-visible:ring-primary/20 transition-all duration-200" 
                      {...field} 
                      data-testid="input-linkedin-url"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <motion.div 
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            type="submit" 
            className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
            disabled={isLoading}
            data-testid="button-save-profiles"
          >
            {isLoading ? "Saving..." : (
              <span className="flex items-center gap-2">
                Initialize Knowledge Base <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </motion.div>
      </form>
    </Form>
  );
}
