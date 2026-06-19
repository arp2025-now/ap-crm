import { Mail, Phone } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import type { Customer } from "@/lib/types";

export function CustomerHeader({ customer }: { customer: Customer }) {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-6 text-white shadow-xl">
      {/* Decorative blobs */}
      <div className="absolute -top-10 -end-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-8 -start-8 h-32 w-32 rounded-full bg-sky-400/20 blur-2xl" />

      <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
        <Avatar className="h-20 w-20 rounded-2xl ring-4 ring-white/20">
          <AvatarFallback className="bg-white/20 backdrop-blur-sm text-white text-2xl font-bold rounded-2xl">
            {getInitials(customer.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center md:text-start space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight">{customer.name}</h2>
          <p className="text-white/70">
            {customer.company} • {customer.industry}
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
            {customer.tags.map((tag) => (
              <Badge key={tag} className="bg-white/15 text-white border-white/20 hover:bg-white/25">{tag}</Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="rounded-xl h-12 w-12 bg-white/15 border-white/20 text-white hover:bg-white/25">
            <Mail className="h-5 w-5" />
          </Button>
          <Button size="icon" className="rounded-xl h-12 w-12 bg-white text-blue-700 hover:bg-white/90 shadow-lg">
            <Phone className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
