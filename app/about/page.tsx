/**
 * About page — Company overview, services intro, inspection detail
 */
import { Shirt, ClipboardCheck, Shield, Eye, Award, Users, CheckCircle, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ─── Data ─────────────────────────────────────────────────

const values = [
  { icon: Shield, title: "Quality First", description: "Every garment passes through rigorous quality checks at multiple stages of production." },
  { icon: Eye, title: "Transparency", description: "Full visibility into the manufacturing process with regular updates and reporting." },
  { icon: Award, title: "Excellence", description: "Committed to exceeding client expectations through continuous improvement." },
  { icon: Users, title: "Partnership", description: "We treat every client relationship as a long-term partnership built on trust." },
];

const inspectionServices = [
  "Pre-production material inspection",
  "In-line production inspection",
  "Final random inspection (AQL 2.5)",
  "Packaging and labeling verification",
  "Color fastness and shrinkage testing",
  "Container loading supervision",
];

// ─── Component ────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light mb-4">About MPSS</h1>
          <p className="text-lg text-indigo-100 font-light max-w-2xl mx-auto">
            My Profile Sourcing Solutions — your trusted partner in custom apparel manufacturing and quality inspection since 2015.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mission statement */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-light text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 font-light leading-relaxed text-lg">
            To empower brands and businesses worldwide with premium custom apparel solutions and uncompromising quality
            inspection services. We bridge the gap between design vision and manufactured reality.
          </p>
        </div>

        {/* Service intro cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-blue-50">
                  <Shirt className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-light text-gray-900">Custom Apparel</h2>
              </div>
              <p className="text-gray-600 font-light leading-relaxed mb-4">
                From concept to creation, we manufacture custom clothing that reflects your brand identity.
                Our state-of-the-art facilities and skilled artisans ensure every piece meets your exact specifications.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="font-light">T-Shirts</Badge>
                <Badge variant="secondary" className="font-light">Hoodies</Badge>
                <Badge variant="secondary" className="font-light">Uniforms</Badge>
                <Badge variant="secondary" className="font-light">Sportswear</Badge>
                <Badge variant="secondary" className="font-light">Workwear</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-600" />
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-emerald-50">
                  <ClipboardCheck className="h-6 w-6 text-emerald-600" />
                </div>
                <h2 className="text-xl font-light text-gray-900">Quality Inspection</h2>
              </div>
              <p className="text-gray-600 font-light leading-relaxed mb-4">
                Our certified inspectors ensure your products meet international quality standards
                before they leave the factory floor. We provide detailed reports with actionable insights.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="font-light">AQL 2.5</Badge>
                <Badge variant="secondary" className="font-light">ISO Standards</Badge>
                <Badge variant="secondary" className="font-light">Lab Testing</Badge>
                <Badge variant="secondary" className="font-light">Documentation</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Company values */}
        <div className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-light text-center text-gray-900 mb-2">Our Values</h2>
          <p className="text-center text-gray-500 font-light mb-10">Principles that guide everything we do</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div key={i} className="text-center group">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-100 transition-colors">
                  <v.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-base font-light text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 font-light">{v.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Inspection services detail */}
        <div className="bg-white rounded-2xl border p-6 sm:p-10 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <Badge className="font-light mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Inspection Services</Badge>
              <h2 className="text-2xl font-light text-gray-900 mb-4">Comprehensive Quality Assurance</h2>
              <p className="text-gray-600 font-light leading-relaxed mb-6">
                Our quality inspection team operates across major manufacturing hubs in South India.
                We provide end-to-end inspection services covering every stage of your production cycle.
              </p>
              <ul className="space-y-3">
                {inspectionServices.map((service, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 font-light">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    {service}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-8 text-center">
              <Globe className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-lg font-light text-gray-900 mb-2">Global Reach</h3>
              <p className="text-sm text-gray-600 font-light">
                Serving 500+ clients across 20+ countries with consistent quality standards and reliable inspection coverage.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xl text-gray-900 font-light">10+</p>
                  <p className="text-xs text-gray-500 font-light">Years</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xl text-gray-900 font-light">50K+</p>
                  <p className="text-xs text-gray-500 font-light">Inspections</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
