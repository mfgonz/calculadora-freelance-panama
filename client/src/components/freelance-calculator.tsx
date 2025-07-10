import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Calculator, Target, Building, Percent, Clock, TrendingUp, Download, Printer, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { calculateFreelanceRate, formatCurrency, formatNumber } from "@/lib/calculations";
import type { FreelanceCalculationInputs, FreelanceCalculationResults } from "@/lib/calculations";

export default function FreelanceCalculator() {
  // Load saved data from localStorage
  const loadSavedData = (): FreelanceCalculationInputs => {
    try {
      const savedInputs = localStorage.getItem('freelanceCalculatorInputs');
      return savedInputs ? JSON.parse(savedInputs) : {
        annualIncome: 50000,
        officeRent: 800,
        equipment: 200,
        insurance: 150,
        marketing: 300,
        training: 100,
        otherExpenses: 200,
        incomeTax: 15, // 15% para ingresos hasta $50,000 según DGI
        socialSecurity: 7.25, // CSS IVM obligatorio para independientes según Ley 51-2005 modificada 2025
        educationInsurance: 1.25, // Seguro educativo
        hoursPerWeek: 40,
        weeksPerYear: 50,
        vacationDays: 14
      };
    } catch (error) {
      return {
        annualIncome: 50000,
        officeRent: 800,
        equipment: 200,
        insurance: 150,
        marketing: 300,
        training: 100,
        otherExpenses: 200,
        incomeTax: 15, // 15% para ingresos hasta $50,000 según DGI
        socialSecurity: 7.25, // CSS IVM obligatorio para independientes según Ley 51-2005 modificada 2025
        educationInsurance: 1.25, // Seguro educativo
        hoursPerWeek: 40,
        weeksPerYear: 50,
        vacationDays: 14
      };
    }
  };

  const savedInputs = loadSavedData();
  const [inputs, setInputs] = useState<FreelanceCalculationInputs>(savedInputs);
  const [includeDeductions, setIncludeDeductions] = useState(true);
  const [results, setResults] = useState<FreelanceCalculationResults>(() => 
    calculateFreelanceRate(savedInputs)
  );
  const [resultsWithoutDeductions, setResultsWithoutDeductions] = useState<FreelanceCalculationResults>(() => 
    calculateFreelanceRate({...savedInputs, incomeTax: 0, socialSecurity: 0, educationInsurance: 0})
  );

  // Clear localStorage when tab is closed
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem('freelanceCalculatorInputs');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleInputChange = useCallback((field: keyof FreelanceCalculationInputs, value: number) => {
    const newInputs = { ...inputs, [field]: value };

    // Sync annual and monthly income
    if (field === 'annualIncome') {
      // When annual income changes, don't auto-update monthly
      // Let the user see the annual input they entered
    }

    setInputs(newInputs);
    setResults(calculateFreelanceRate(newInputs));
    setResultsWithoutDeductions(calculateFreelanceRate({
      ...newInputs, 
      incomeTax: 0, 
      socialSecurity: 0, 
      educationInsurance: 0
    }));

    // Save to localStorage
    localStorage.setItem('freelanceCalculatorInputs', JSON.stringify(newInputs));
  }, [inputs]);

  const handleMonthlyIncomeChange = useCallback((monthlyValue: number) => {
    const annualValue = monthlyValue * 12;
    const newInputs = { ...inputs, annualIncome: annualValue };
    setInputs(newInputs);
    setResults(calculateFreelanceRate(newInputs));
    setResultsWithoutDeductions(calculateFreelanceRate({
      ...newInputs, 
      incomeTax: 0, 
      socialSecurity: 0, 
      educationInsurance: 0
    }));

    // Save to localStorage
    localStorage.setItem('freelanceCalculatorInputs', JSON.stringify(newInputs));
  }, [inputs]);

  const handleExport = () => {
    const timestamp = new Date().toLocaleDateString('es-PA', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let csvContent = `Calculadora de Tarifas Freelance - Panama\nFecha: ${timestamp}\n\n`;

    // Inputs section
    csvContent += `Configuracion de Entrada,Valor\n`;
    csvContent += `Ingreso Anual Deseado,${formatCurrency(inputs.annualIncome)}\n`;
    csvContent += `Ingreso Mensual Deseado,${formatCurrency(inputs.annualIncome / 12)}\n`;
    csvContent += `Alquiler de Oficina (Mensual),${formatCurrency(inputs.officeRent)}\n`;
    csvContent += `Equipos y Software (Mensual),${formatCurrency(inputs.equipment)}\n`;
    csvContent += `Seguros (Mensual),${formatCurrency(inputs.insurance)}\n`;
    csvContent += `Marketing y Publicidad (Mensual),${formatCurrency(inputs.marketing)}\n`;
    csvContent += `Capacitacion y Desarrollo (Mensual),${formatCurrency(inputs.training)}\n`;
    csvContent += `Otros Gastos (Mensual),${formatCurrency(inputs.otherExpenses)}\n`;
    csvContent += `Impuesto sobre la Renta,${inputs.incomeTax}%\n`;
    csvContent += `Seguro Social CSS,${inputs.socialSecurity}%\n`;
    csvContent += `Seguro Educativo,${inputs.educationInsurance}%\n`;
    csvContent += `Horas por Semana,${inputs.hoursPerWeek}\n`;
    csvContent += `Semanas de Trabajo al Año,${inputs.weeksPerYear}\n`;
    csvContent += `Dias de Vacaciones,${inputs.vacationDays}\n\n`;

    // Results section
    csvContent += `Resultados del Calculo,Valor\n`;
    csvContent += `Tarifa por Hora Recomendada,${formatCurrency(results.hourlyRate)}\n`;
    csvContent += `Ingreso Bruto Anual,${formatCurrency(results.grossAnnualIncome)}\n`;
    csvContent += `Gastos Anuales,${formatCurrency(results.annualExpenses)}\n`;
    csvContent += `Impuestos Estimados,${formatCurrency(results.annualTaxes)}\n`;
    csvContent += `Ingreso Neto Anual,${formatCurrency(results.netAnnualIncome)}\n`;
    csvContent += `Horas Facturables por Año,${formatNumber(results.billableHours)}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `freelance-calculation-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Input Section */}
      <div className="lg:col-span-2 space-y-6">
        {/* Income Target Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Meta de Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="annual-income">Ingreso Anual Deseado (Neto)</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <div className="space-y-2 text-sm">
                          <p><strong>¿Por qué sube el ingreso bruto cuando añado gastos?</strong></p>
                          <p>Porque los gastos son deducibles de impuestos. Necesitas:</p>
                          <p>1. Ingreso suficiente para cubrir gastos</p>
                          <p>2. Ingreso adicional para que después de impuestos te quede tu meta</p>
                          <p><strong>Ejemplo:</strong> Meta ${formatCurrency(inputs.annualIncome)} netos → Necesitas ${formatCurrency(results.grossAnnualIncome)} brutos</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="annual-income"
                    type="number"
                    className="pl-8"
                    value={inputs.annualIncome}
                    onChange={(e) => handleInputChange('annualIncome', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <p className="text-xs text-gray-500">Este es el dinero que quieres recibir después de pagar impuestos y gastos 🤩</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly-income">Ingreso Mensual Deseado</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="monthly-income"
                    type="number"
                    className="pl-8"
                    value={Math.round(inputs.annualIncome / 12)}
                    onChange={(e) => handleMonthlyIncomeChange(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Expenses Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Gastos de Negocio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="office-rent">Alquiler de Oficina (Mensual)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="office-rent"
                    type="number"
                    className="pl-8"
                    value={inputs.officeRent}
                    onChange={(e) => handleInputChange('officeRent', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <p className="text-xs text-gray-500">Anual: {formatCurrency(inputs.officeRent * 12)}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment">Equipos y Software (Mensual)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="equipment"
                    type="number"
                    className="pl-8"
                    value={inputs.equipment}
                    onChange={(e) => handleInputChange('equipment', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <p className="text-xs text-gray-500">Anual: {formatCurrency(inputs.equipment * 12)}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="insurance">Seguros (Mensual)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="insurance"
                    type="number"
                    className="pl-8"
                    value={inputs.insurance}
                    onChange={(e) => handleInputChange('insurance', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <p className="text-xs text-gray-500">Anual: {formatCurrency(inputs.insurance * 12)}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="marketing">Marketing y Publicidad (Mensual)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="marketing"
                    type="number"
                    className="pl-8"
                    value={inputs.marketing}
                    onChange={(e) => handleInputChange('marketing', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <p className="text-xs text-gray-500">Anual: {formatCurrency(inputs.marketing * 12)}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="training">Capacitación y Desarrollo (Mensual)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="training"
                    type="number"
                    className="pl-8"
                    value={inputs.training}
                    onChange={(e) => handleInputChange('training', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <p className="text-xs text-gray-500">Anual: {formatCurrency(inputs.training * 12)}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="other-expenses">Otros Gastos (Mensual)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="other-expenses"
                    type="number"
                    className="pl-8"
                    value={inputs.otherExpenses}
                    onChange={(e) => handleInputChange('otherExpenses', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <p className="text-xs text-gray-500">Anual: {formatCurrency(inputs.otherExpenses * 12)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-primary" />
              Configuración Fiscal - Panamá
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="income-tax">Impuesto sobre la Renta (%)</Label>
                <Input
                  id="income-tax"
                  type="number"
                  step="0.1"
                  value={inputs.incomeTax}
                  onChange={(e) => handleInputChange('incomeTax', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="social-security">Seguro Social CSS (%)</Label>
                <Input
                  id="social-security"
                  type="number"
                  step="0.1"
                  value={inputs.socialSecurity}
                  onChange={(e) => handleInputChange('socialSecurity', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="education-insurance">Seguro Educativo (%)</Label>
                <Input
                  id="education-insurance"
                  type="number"
                  step="0.1"
                  value={inputs.educationInsurance}
                  onChange={(e) => handleInputChange('educationInsurance', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Schedule Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Horario de Trabajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hours-per-week">Horas por Semana</Label>
                <Input
                  id="hours-per-week"
                  type="number"
                  value={inputs.hoursPerWeek}
                  onChange={(e) => handleInputChange('hoursPerWeek', parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-gray-500">1 Semana = 168 horas</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weeks-per-year">Semanas de Trabajo al Año</Label>
                <Input
                  id="weeks-per-year"
                  type="number"
                  value={inputs.weeksPerYear}
                  onChange={(e) => handleInputChange('weeksPerYear', parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-gray-500">Un año = 52 semanas</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vacation-days">Días de Vacaciones</Label>
                <Input
                  id="vacation-days"
                  type="number"
                  value={inputs.vacationDays}
                  onChange={(e) => handleInputChange('vacationDays', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Results Section */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Resultados de Cálculo
            </CardTitle>
            {/* Toggle for including/excluding deductions */}
            <div className="flex items-center justify-between mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sin deducciones legales</span>
                <Switch
                  checked={includeDeductions}
                  onCheckedChange={setIncludeDeductions}
                />
                <span className="text-sm text-gray-600">Con deducciones legales</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Activa para ver la tarifa que incluye CSS, Seguro Educativo e ISR.
                      Desactiva para ver la tarifa sin considerar estas deducciones.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            {/* Main Rate Display - Prominent like Upwork */}
            <div className="text-center p-6 bg-gradient-to-r from-primary/5 to-blue-50 rounded-xl mb-6">
              <p className="text-sm text-gray-600 mb-2">
                Tu tarifa por hora recomendada {includeDeductions ? '(con deducciones)' : '(sin deducciones)'}
              </p>
              <p className="text-4xl font-bold text-primary mb-2">
                {formatCurrency(includeDeductions ? results.hourlyRate : resultsWithoutDeductions.hourlyRate)}
              </p>
              <p className="text-xs text-gray-500">por hora</p>
              
              {/* Show comparison if deductions toggle is active */}
              {includeDeductions && (
                <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
                  <p className="text-xs text-gray-600">
                    Sin deducciones: <span className="font-semibold">{formatCurrency(resultsWithoutDeductions.hourlyRate)}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Diferencia: {formatCurrency(results.hourlyRate - resultsWithoutDeductions.hourlyRate)}
                  </p>
                </div>
              )}
            </div>

            {/* Key Annual Numbers - Simple Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(includeDeductions ? results.netAnnualIncome : resultsWithoutDeductions.netAnnualIncome)}
                </p>
                <p className="text-xs text-gray-600">Ingreso neto anual</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-lg font-bold text-blue-600">
                  {formatNumber(includeDeductions ? results.billableHours : resultsWithoutDeductions.billableHours)}
                </p>
                <p className="text-xs text-gray-600">Horas facturables</p>
              </div>
            </div>

            {/* Simple Financial Breakdown */}
            <div className="bg-white border rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Desglose anual</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ingreso bruto</span>
                  <span className="font-medium">
                    {formatCurrency(includeDeductions ? results.grossAnnualIncome : resultsWithoutDeductions.grossAnnualIncome)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gastos de negocio</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(includeDeductions ? results.annualExpenses : resultsWithoutDeductions.annualExpenses)}
                  </span>
                </div>
                {includeDeductions && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Impuestos y deducciones</span>
                    <span className="font-medium text-red-600">-{formatCurrency(results.annualTaxes)}</span>
                  </div>
                )}
                {includeDeductions && (results.taxSavingsFromExpenses || 0) > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Ahorro fiscal por gastos</span>
                    <span className="font-medium text-green-600">+{formatCurrency(results.taxSavingsFromExpenses || 0)}</span>
                  </div>
                )}
                <hr className="border-gray-200" />
                <div className="flex justify-between font-semibold pt-1">
                  <span>Ingreso neto</span>
                  <span className="text-green-600">
                    {formatCurrency(includeDeductions ? results.netAnnualIncome : resultsWithoutDeductions.netAnnualIncome)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button onClick={handleExport} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Exportar Cálculo
              </Button>
              <Button onClick={handlePrint} variant="outline" className="w-full">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}