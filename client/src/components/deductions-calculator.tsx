import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { User, Calculator, CheckCircle, Info, Gavel, Download, Printer, HelpCircle, Briefcase } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { calculateDeductions, calculateEstimatedGrossSalary, formatCurrency } from "@/lib/calculations";
import type { DeductionCalculationInputs, DeductionCalculationResults, EstimationCalculationInputs } from "@/lib/calculations";

export default function DeductionsCalculator() {
  // Load saved data from localStorage
  const loadSavedData = () => {
    try {
      const savedInputs = localStorage.getItem('deductionCalculatorInputs');
      
      return savedInputs ? {
        ...JSON.parse(savedInputs),
        birthDate: new Date(JSON.parse(savedInputs).birthDate)
      } : {
        birthDate: new Date('1990-01-01'),
        monthlySalary: 3000,
        isIndependent: false
      };
    } catch (error) {
      return {
        birthDate: new Date('1990-01-01'),
        monthlySalary: 3000,
        isIndependent: false
      };
    }
  };

  const savedData = loadSavedData();
  const [inputs, setInputs] = useState<DeductionCalculationInputs>(savedData);
  const [isEstimationMode, setIsEstimationMode] = useState(false);

  // Helper function to format date for input field (YYYY-MM-DD)
  const formatDateForInput = (date: Date): string => {
    if (!date || isNaN(date.getTime())) {
      return '';
    }
    return date.toISOString().split('T')[0];
  };

  // Helper function to format date for display (DD/MM/YYYY)
  const formatDateForDisplay = (date: Date): string => {
    if (!date || isNaN(date.getTime())) {
      return '';
    }
    return date.toLocaleDateString('es-PA', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const [results, setResults] = useState<DeductionCalculationResults | null>(null);
  const [estimationResults, setEstimationResults] = useState<(DeductionCalculationResults & { estimatedGrossSalary: number }) | null>(null);

  // Clear localStorage when tab is closed
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem('deductionCalculatorInputs');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleInputChange = useCallback((field: keyof DeductionCalculationInputs, value: Date | number) => {
    const newInputs = { ...inputs, [field]: value };
    setInputs(newInputs);

    // Save to localStorage
    localStorage.setItem('deductionCalculatorInputs', JSON.stringify({
      ...newInputs,
      birthDate: newInputs.birthDate.toISOString()
    }));
  }, [inputs]);

  // Update calculation when inputs change
  useEffect(() => {
    if (inputs.birthDate && inputs.monthlySalary > 0) {
      if (isEstimationMode) {
        // For estimation mode, treat monthlySalary as targetNetSalary
        const estimationInputs: EstimationCalculationInputs = {
          birthDate: inputs.birthDate,
          targetNetSalary: inputs.monthlySalary,
          isIndependent: inputs.isIndependent
        };
        setEstimationResults(calculateEstimatedGrossSalary(estimationInputs));
        setResults(null);
      } else {
        // For deduction mode, treat monthlySalary as gross monthly salary
        setResults(calculateDeductions(inputs));
        setEstimationResults(null);
      }
    }
  }, [inputs, isEstimationMode]);

  const handleExport = () => {
    const activeResults = isEstimationMode ? estimationResults : results;
    if (!activeResults) return;

    const timestamp = new Date().toLocaleDateString('es-PA', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let csvContent = `Calculadora de Deducciones - Panama\nFecha: ${timestamp}\n\n`;
    csvContent += `Campo,Valor\n`;
    csvContent += `Fecha de Nacimiento,${formatDateForDisplay(inputs.birthDate)}\n`;
    
    if (isEstimationMode) {
      csvContent += `Salario Neto Deseado,${formatCurrency(inputs.monthlySalary)}\n`;
      csvContent += `Salario Bruto Estimado,${formatCurrency(estimationResults!.estimatedGrossSalary)}\n`;
    } else {
      csvContent += `Salario Mensual Bruto,${formatCurrency(inputs.monthlySalary)}\n`;
    }
    
    csvContent += `Elegible para CSS,${activeResults.isCSSEligible ? 'Si' : 'No'}\n\n`;
    csvContent += `Deducciones,Monto,Porcentaje\n`;
    
    if (activeResults.isCSSEligible) {
      csvContent += `CSS (Seguro Social),${formatCurrency(activeResults.cssAmount)},${activeResults.cssRate}%\n`;
    }
    if (activeResults.incomeTaxAmount > 0) {
      csvContent += `Impuesto sobre la Renta,${formatCurrency(activeResults.incomeTaxAmount)},${activeResults.incomeTaxRate}%\n`;
    }
    csvContent += `Seguro Educativo,${formatCurrency(activeResults.educationAmount)},${activeResults.educationRate}%\n`;
    csvContent += `Total Deducciones,${formatCurrency(activeResults.totalDeductions)},\n`;
    csvContent += `Salario Neto Mensual,${formatCurrency(activeResults.netSalary)},\n`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deductions-calculation-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const activeResults = isEstimationMode ? estimationResults : results;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Calculadora de Deducciones
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-6 w-6 text-gray-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                  ℹ️ Esta calculadora sirve para dos propósitos: calcular deducciones de un salario bruto conocido, 
                    o estimar el salario bruto necesario para obtener un salario neto deseado.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          
          {/* Toggle for calculation mode */}
          <div className="flex items-center justify-between mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Calcular deducciones</span>
              <Switch
                checked={isEstimationMode}
                onCheckedChange={setIsEstimationMode}
              />
              <span className="text-sm text-gray-600">Estimar salario bruto</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="birth-date">Fecha de Nacimiento (DD/MM/YYYY)</Label>
                      <Input
                        id="birth-date"
                        type="date"
                        value={formatDateForInput(inputs.birthDate)}
                        onChange={(e) => {
                          if (e.target.value) {
                            const date = new Date(e.target.value);
                            handleInputChange('birthDate', date);
                          }
                        }}
                      />
                      <p className="text-xs text-gray-500">
                        Necesario para determinar elegibilidad CSS (Ley 51 del 27 de Diciembre del 2005)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthly-salary">
                        {isEstimationMode ? 'Salario Neto Deseado' : 'Salario Mensual Bruto'}
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          id="monthly-salary"
                          type="number"
                          className="pl-8"
                          value={inputs.monthlySalary}
                          onChange={(e) => handleInputChange('monthlySalary', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        {isEstimationMode 
                          ? 'Ingrese el salario neto que desea recibir' 
                          : 'Ingrese el salario bruto antes de deducciones'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Worker Type Selection */}
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-amber-600" />
                      <div className="flex-1">
                        <Label className="text-sm font-medium text-amber-900">Tipo de Trabajador</Label>
                        <p className="text-xs text-amber-700 mt-1">
                          Selecciona tu tipo de trabajador para aplicar las tasas correctas según la Ley 462 de 2025
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center space-x-2">
                      <Checkbox
                        id="worker-type"
                        checked={inputs.isIndependent}
                        onCheckedChange={(checked) => handleInputChange('isIndependent', checked === true)}
                      />
                      <Label htmlFor="worker-type" className="text-sm">
                        Soy trabajador independiente/freelancer
                      </Label>
                    </div>
                    <div className="mt-2 text-xs text-amber-700">
                      {inputs.isIndependent ? (
                        <p>✓ Aplicando tasas para independientes: CSS 9.36% + Seguro Educativo 1.25%</p>
                      ) : (
                        <p>✓ Aplicando tasas para empleados: CSS 9.75% + Seguro Educativo 1.25%</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Eligibility Status Card */}
              {activeResults && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-success" />
                      Estado de Elegibilidad
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activeResults.isCSSEligible ? (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          <div className="font-medium">Elegible para aportes CSS</div>
                          <p className="text-sm mt-1">
                            Fecha de nacimiento: {formatDateForDisplay(inputs.birthDate)} 
                            (posterior al 1 de enero de 1972)
                          </p>
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="bg-gray-50 border-gray-200">
                        <Info className="h-4 w-4 text-gray-600" />
                        <AlertDescription className="text-gray-800">
                          <div className="font-medium">No elegible para aportes CSS</div>
                          <p className="text-sm mt-1">
                            Fecha de nacimiento: {formatDateForDisplay(inputs.birthDate)} 
                            (anterior al 1 de enero de 1972)
                          </p>
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Legal Framework Card */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Gavel className="h-5 w-5 text-blue-600" />
                    Marco Legal - República de Panamá
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-blue-800">
                    <div>
                      <p><strong>Ley 462 del 18 de Marzo del 2025:</strong></p>
                      <div className="ml-4 space-y-2">
                        <div className="p-2 bg-blue-100 rounded">
                          <p className="font-medium">Para Empleados:</p>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>CSS: 9.75% (obligatorio)</li>
                            <li>Seguro Educativo: 1.25%</li>
                            <li><strong>Total: 11%</strong></li>
                          </ul>
                        </div>
                        <div className="p-2 bg-amber-100 rounded">
                          <p className="font-medium">Para Trabajadores Independientes:</p>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>IVM: 9.36% (obligatorio)</li>
                            <li>Seguro Educativo: 1.25%</li>
                            <li>E&M: 8.5% (voluntario - no incluido en cálculo)</li>
                            <li><strong>Total obligatorio: 10.61%</strong></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p><strong>Ley 51 del 27 de Diciembre del 2005:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Elegibilidad: nacidos el 1 de enero de 1972 o después</li>
                        <li>Aplica a trabajadores independientes y empleados</li>
                      </ul>
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
                    <Calculator className="h-5 w-5 text-success" />
                    {isEstimationMode ? 'Estimación de Salario' : 'Cálculo de Deducciones'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeResults ? (
                    <>
                      {/* Main Salary Display */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
                        <div className="text-center">
                          {isEstimationMode ? (
                            <>
                              <p className="text-sm text-gray-600 mb-1">Salario Bruto Requerido</p>
                              <p className="text-2xl font-bold text-blue-700">{formatCurrency(estimationResults!.estimatedGrossSalary)}</p>
                              <p className="text-xs text-gray-500 mt-2">
                                Para obtener: {formatCurrency(inputs.monthlySalary)} neto
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm text-gray-600 mb-1">Salario Neto Mensual</p>
                              <p className="text-2xl font-bold text-green-700">{formatCurrency(activeResults.netSalary)}</p>
                              <p className="text-xs text-gray-500 mt-2">
                                Desde: {formatCurrency(inputs.monthlySalary)} bruto
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Deductions Breakdown */}
                      <div className="bg-white border rounded-lg p-4 mb-6">
                        <h4 className="font-medium text-gray-900 mb-3">Desglose de Deducciones</h4>
                        <div className="space-y-2 text-sm">
                          {activeResults.isCSSEligible && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">CSS ({activeResults.cssRate}%)</span>
                              <span className="font-medium text-red-600">{formatCurrency(activeResults.cssAmount)}</span>
                            </div>
                          )}
                          {activeResults.incomeTaxAmount > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">ISR ({activeResults.incomeTaxRate}%)</span>
                              <span className="font-medium text-red-600">{formatCurrency(activeResults.incomeTaxAmount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600">Seg. Educativo ({activeResults.educationRate}%)</span>
                            <span className="font-medium text-red-600">{formatCurrency(activeResults.educationAmount)}</span>
                          </div>
                          <hr className="border-gray-200" />
                          <div className="flex justify-between font-semibold pt-1">
                            <span>Total Deducciones</span>
                            <span className="text-red-600">{formatCurrency(activeResults.totalDeductions)}</span>
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
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calculator className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>Ingrese sus datos para ver el cálculo</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}