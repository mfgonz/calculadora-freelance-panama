import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Receipt, Building } from "lucide-react";
import FreelanceCalculator from "@/components/freelance-calculator";
import DeductionsCalculator from "@/components/deductions-calculator";
import yappyLogo from "@assets/Yappy_1_1752123588073.png";
import bmcLogo from "@assets/bmc-button_1752123703889.png";
import yappy_color_landscape from "@assets/yappy-color-landscape.png";
export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-lg">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Calculadora Freelance</h1>
                <p className="text-sm text-gray-600">Panamá - Cálculos oficiales</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">🇵🇦</span>
              <span className="text-sm font-medium text-gray-700">República de Panamá</span>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="rates" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="rates" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Calculadora de Tarifas Freelance
            </TabsTrigger>
            <TabsTrigger value="deductions" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Calculadora de Deducciones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rates" className="mt-0">
            <FreelanceCalculator />
          </TabsContent>

          <TabsContent value="deductions" className="mt-0">
            <DeductionsCalculator />
          </TabsContent>
        </Tabs>
      </main>
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Donation Section */}
          <div className="text-center mb-6">
            <p className="mb-4 text-[16px] text-[#1c1e1f]">¿Te gusta esta herramienta? Haz una donación para mostrar tu apoyo 💪🏽 Creado por <a href="https://instagram.com/mfgonz" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@mfgonz</a></p>
            <div className="flex justify-center items-center gap-6">
              {/* Yappy Donation */}
              <a 
                href="https://link.yappy.com.pa/stc/y%2F4nv4rqJ5hLwKoMH1eNqBSk16Vdr9BZvaim7nGhYrA%3D" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block hover:opacity-80 transition-opacity"
              >
                <img 
                  src={yappy_color_landscape} 
                  alt="Donar con Yappy" 
                  className="h-12 w-auto"
                />
              </a>

              {/* Buy Me a Coffee */}
              <a 
                href="https://www.buymeacoffee.com/mfgonz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block hover:opacity-80 transition-opacity"
              >
                <img 
                  src={bmcLogo} 
                  alt="Buy me a coffee" 
                  className="h-12 w-auto"
                />
              </a>
            </div>
          </div>

          {/* Footer Text */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              © 2025 Calculadora Freelance Panamá. Cálculos basados en legislación vigente al 10 de Julio de 2025, República de Panamá.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Esta herramienta es informativa. Consulte con un profesional para asesoría fiscal específica.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
