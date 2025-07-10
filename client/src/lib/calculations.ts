export interface FreelanceCalculationInputs {
  annualIncome: number;
  officeRent: number;
  equipment: number;
  insurance: number;
  marketing: number;
  training: number;
  otherExpenses: number;
  incomeTax: number;
  socialSecurity: number;
  educationInsurance: number;
  hoursPerWeek: number;
  weeksPerYear: number;
  vacationDays: number;
}

export interface FreelanceCalculationResults {
  hourlyRate: number;
  grossAnnualIncome: number;
  annualExpenses: number;
  annualTaxes: number;
  netAnnualIncome: number;
  billableHours: number;
  taxableIncome: number;
  taxSavingsFromExpenses: number;
}

export interface DeductionCalculationInputs {
  birthDate: Date;
  monthlySalary: number;
  isIndependent?: boolean; // true for independent worker, false for employee
}

export interface EstimationCalculationInputs {
  birthDate: Date;
  targetNetSalary: number;
  isIndependent?: boolean; // true for independent worker, false for employee
}

export interface DeductionCalculationResults {
  isCSSEligible: boolean;
  cssAmount: number;
  cssRate: number;
  incomeTaxAmount: number;
  incomeTaxRate: number;
  educationAmount: number;
  educationRate: number;
  totalDeductions: number;
  netSalary: number;
}

export function calculateFreelanceRate(inputs: FreelanceCalculationInputs): FreelanceCalculationResults {
  const {
    annualIncome, // This is the desired NET annual income after taxes
    officeRent,
    equipment,
    insurance,
    marketing,
    training,
    otherExpenses,
    incomeTax,
    socialSecurity,
    educationInsurance,
    hoursPerWeek,
    weeksPerYear,
    vacationDays
  } = inputs;

  // Step 1: Calculate annual business expenses (these are tax-deductible)
  const monthlyExpenses = officeRent + equipment + insurance + marketing + training + otherExpenses;
  const annualExpenses = monthlyExpenses * 12;

  // Step 2: Calculate billable hours per year
  const totalHoursPerYear = hoursPerWeek * weeksPerYear;
  const vacationHours = (vacationDays / 5) * hoursPerWeek; // Assuming 5-day work week
  const billableHours = totalHoursPerYear - vacationHours;

  // Helper function to calculate progressive income tax (ISR)
  const calculateProgressiveIncomeTax = (taxableIncome: number): number => {
    if (taxableIncome <= 11000) {
      return 0; // Exento hasta $11,000
    } else if (taxableIncome <= 50000) {
      return (taxableIncome - 11000) * 0.15; // 15% sobre el exceso de $11,000
    } else {
      return (50000 - 11000) * 0.15 + (taxableIncome - 50000) * 0.25; // 25% sobre el exceso de $50,000
    }
  };

  // Helper function to calculate total taxes for a given taxable income
  const calculateTotalTaxes = (taxableIncome: number): number => {
    // Use the user-configured income tax rate if it's different from progressive rates
    // If incomeTax is 15 or 25, use progressive calculation
    // Otherwise, use the flat rate specified by the user
    let incomeTaxAmount = 0;
    
    if (incomeTax === 15 || incomeTax === 25) {
      // Use progressive tax calculation
      incomeTaxAmount = calculateProgressiveIncomeTax(taxableIncome);
    } else {
      // Use flat rate specified by user
      if (taxableIncome > 11000) {
        incomeTaxAmount = (taxableIncome - 11000) * (incomeTax / 100);
      }
    }
    
    const cssAmount = taxableIncome * (socialSecurity / 100);
    const educationAmount = taxableIncome * (educationInsurance / 100);
    return incomeTaxAmount + cssAmount + educationAmount;
  };

  // Step 3: Work backwards from desired net income using iterative approach
  // We need to find grossAnnualIncome such that:
  // (grossAnnualIncome - annualExpenses - taxes) = annualIncome
  
  let grossAnnualIncome = annualIncome + annualExpenses + 10000; // Initial estimate
  let iterations = 0;
  const maxIterations = 50;

  while (iterations < maxIterations) {
    const taxableIncome = grossAnnualIncome - annualExpenses;
    const totalTaxes = calculateTotalTaxes(taxableIncome);
    const netIncome = grossAnnualIncome - annualExpenses - totalTaxes;
    
    const difference = annualIncome - netIncome;
    
    // If we're close enough (within $0.01), we're done
    if (Math.abs(difference) < 0.01) {
      break;
    }
    
    // Adjust gross income based on the difference
    // Use a dynamic factor based on the difference size
    let adjustmentFactor = 1.35;
    if (Math.abs(difference) < 100) {
      adjustmentFactor = 1.2; // More conservative for small differences
    } else if (Math.abs(difference) < 10) {
      adjustmentFactor = 1.1; // Very conservative for tiny differences
    }
    
    grossAnnualIncome += difference * adjustmentFactor;
    
    // Ensure we don't go negative
    if (grossAnnualIncome < annualExpenses) {
      grossAnnualIncome = annualExpenses + 1000;
      break;
    }
    
    iterations++;
  }

  // Step 4: Calculate final values
  const finalTaxableIncome = grossAnnualIncome - annualExpenses;
  const annualTaxes = calculateTotalTaxes(finalTaxableIncome);
  const actualNetIncome = grossAnnualIncome - annualExpenses - annualTaxes;
  
  // Ensure the net income matches exactly the desired amount (round to nearest cent)
  const adjustedNetIncome = Math.round(actualNetIncome * 100) / 100;

  // Step 5: Calculate tax savings from expenses
  const taxesWithoutExpenses = calculateTotalTaxes(grossAnnualIncome);
  const taxSavingsFromExpenses = taxesWithoutExpenses - annualTaxes;

  // Step 6: Calculate hourly rate
  const hourlyRate = billableHours > 0 ? grossAnnualIncome / billableHours : 0;

  return {
    hourlyRate,
    grossAnnualIncome,
    annualExpenses,
    annualTaxes,
    netAnnualIncome: adjustedNetIncome,
    billableHours,
    taxableIncome: finalTaxableIncome,
    taxSavingsFromExpenses
  };
}

export function calculateDeductions(inputs: DeductionCalculationInputs): DeductionCalculationResults {
  const { birthDate, monthlySalary, isIndependent = false } = inputs;

  // Check CSS eligibility (Law 51 of December 27, 2005)
  // Workers born on or after January 1, 1972 must contribute to CSS
  const cssEligibilityDate = new Date('1972-01-01');
  const isCSSEligible = birthDate >= cssEligibilityDate;

  const annualSalary = monthlySalary * 12;

  // CSS Calculation 2025 - Law 462 of March 18, 2025
  // For EMPLOYEES: 9.75% CSS (obligatorio) + 1.25% Education = 11% total
  // For INDEPENDENTS: 9.36% IVM (obligatorio) + 8.5% E&M (voluntario) - but E&M is voluntary
  let cssRate: number;
  let cssAmount: number;
  
  if (isIndependent) {
    // Independent workers: 9.36% IVM obligatorio (only obligatory part)
    cssRate = 9.36;
    cssAmount = isCSSEligible ? (monthlySalary * cssRate / 100) : 0;
  } else {
    // Employees: 9.75% CSS obligatorio 
    cssRate = 9.75;
    cssAmount = isCSSEligible ? (monthlySalary * cssRate / 100) : 0;
  }

  // Income Tax Calculation (Progressive rates for Panama)
  let incomeTaxAmount = 0;
  let incomeTaxRate = 0;

  if (annualSalary > 11000) {
    if (annualSalary <= 50000) {
      incomeTaxAmount = (annualSalary - 11000) * 0.15;
      incomeTaxRate = 15;
    } else {
      incomeTaxAmount = (50000 - 11000) * 0.15 + (annualSalary - 50000) * 0.25;
      incomeTaxRate = 25;
    }
  }
  const monthlyIncomeTax = incomeTaxAmount / 12;

  // Educational Insurance 2025 
  // For EMPLOYEES: 1.25% of monthly salary
  // For INDEPENDENTS: 1.25% of monthly salary (same rate)
  const educationRate = 1.25;
  const educationAmount = monthlySalary * educationRate / 100;

  // Total deductions
  const totalDeductions = cssAmount + monthlyIncomeTax + educationAmount;

  // Net salary
  const netSalary = monthlySalary - totalDeductions;

  return {
    isCSSEligible,
    cssAmount,
    cssRate,
    incomeTaxAmount: monthlyIncomeTax,
    incomeTaxRate,
    educationAmount,
    educationRate,
    totalDeductions,
    netSalary
  };
}

export function formatCurrency(amount: number): string {
  return '$' + amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function calculateEstimatedGrossSalary(inputs: EstimationCalculationInputs): DeductionCalculationResults & { estimatedGrossSalary: number } {
  const { birthDate, targetNetSalary, isIndependent = false } = inputs;

  // Check CSS eligibility
  const cssEligibilityDate = new Date('1972-01-01');
  const isCSSEligible = birthDate >= cssEligibilityDate;

  // Starting with an initial estimate
  let estimatedGrossSalary = targetNetSalary;
  let iterations = 0;
  const maxIterations = 50; // Prevent infinite loops

  // Iteratively adjust the gross salary until we reach the target net salary
  while (iterations < maxIterations) {
    const testResults = calculateDeductions({
      birthDate,
      monthlySalary: estimatedGrossSalary,
      isIndependent
    });

    const difference = targetNetSalary - testResults.netSalary;

    // If we're close enough (within $1), we're done
    if (Math.abs(difference) < 1) {
      return {
        ...testResults,
        estimatedGrossSalary
      };
    }

    // Adjust the gross salary based on the difference
    // We need to account for the fact that increasing gross salary also increases taxes
    const adjustmentFactor = 1.2; // Factor to account for tax impact
    estimatedGrossSalary += difference * adjustmentFactor;

    // Ensure we don't go negative
    if (estimatedGrossSalary < 0) {
      estimatedGrossSalary = 0;
      break;
    }

    iterations++;
  }

  // Final calculation with the estimated gross salary
  const finalResults = calculateDeductions({
    birthDate,
    monthlySalary: estimatedGrossSalary,
    isIndependent
  });

  return {
    ...finalResults,
    estimatedGrossSalary
  };
}

// Function specifically for independent workers/freelancers
export function calculateFreelancerDeductions(inputs: DeductionCalculationInputs): DeductionCalculationResults {
  const { birthDate, monthlySalary } = inputs;

  // Check CSS eligibility (Law 51 of December 27, 2005)
  const cssEligibilityDate = new Date('1972-01-01');
  const isCSSEligible = birthDate >= cssEligibilityDate;

  const annualSalary = monthlySalary * 12;

  // CSS Calculation 2025 for FREELANCERS/INDEPENDENTS
  // IVM (Invalidez, Vejez y Muerte) obligatorio: 9.36%
  // E&M (Enfermedad y Maternidad) voluntario: 8.5% (not included in this calculation)
  const cssRate = 9.36;
  const cssAmount = isCSSEligible ? (monthlySalary * cssRate / 100) : 0;

  // Income Tax Calculation (Progressive rates for Panama)
  let incomeTaxAmount = 0;
  let incomeTaxRate = 0;

  if (annualSalary > 11000) {
    if (annualSalary <= 50000) {
      incomeTaxAmount = (annualSalary - 11000) * 0.15;
      incomeTaxRate = 15;
    } else {
      incomeTaxAmount = (50000 - 11000) * 0.15 + (annualSalary - 50000) * 0.25;
      incomeTaxRate = 25;
    }
  }
  const monthlyIncomeTax = incomeTaxAmount / 12;

  // Educational Insurance 2025 (1.25% for independents, but often included in other calculations)
  const educationRate = 1.25;
  const educationAmount = monthlySalary * educationRate / 100;

  // Total deductions
  const totalDeductions = cssAmount + monthlyIncomeTax + educationAmount;

  // Net salary
  const netSalary = monthlySalary - totalDeductions;

  return {
    isCSSEligible,
    cssAmount,
    cssRate,
    incomeTaxAmount: monthlyIncomeTax,
    incomeTaxRate,
    educationAmount,
    educationRate,
    totalDeductions,
    netSalary
  };
}

export function formatNumber(num: number): string {
  return num.toLocaleString('es-PA');
}