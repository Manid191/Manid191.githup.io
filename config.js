/**
 * Power Plant Feasibility - Configuration
 * Centralized location for all default values and constants.
 */
window.AppConfig = {
    defaults: {
        capacity: 10,
        projectYears: 25,
        powerFactor: 0.95,
        hoursPerDay: 24,
        revenue: {
            peakRate: 4.5,
            peakHours: 13,
            offPeakRate: 2.6,
            escalation: 0,
            adderPrice: 0,
            adderYears: 7
        },
        degradation: 0.5,
        capex: {
            construction: 20,
            machinery: 50,
            land: 10
        },
        finance: {
            debtRatio: 70,
            interestRate: 5.0,
            loanTerm: 10,
            taxRate: 20,
            opexInflation: 1.5,
            taxHoliday: 0
        }
    },

    initialOpex: [
        { id: 1, name: 'General Maintenance', type: 'fixed', value: 500000, frequency: 1 },
        { id: 2, name: 'Insurance', type: 'percent_capex', value: 0.5, frequency: 1 }
    ]
};
