/**
 * Power Plant Feasibility - Configuration
 * Centralized location for all default values and constants.
 */
window.AppConfig = {
    defaults: {
        capacity: 9.9,
        projectYears: 20,
        powerFactor: 0.90,
        hoursPerDay: 24,
        daysPerYear: 334,
        revenue: {
            peakRate: 4.5,
            peakHours: 13,
            offPeakRate: 2.6,
            escalation: 0.5,
            adderPrice: 0,
            adderYears: 7
        },
        degradation: 0.5,
        capex: {
            construction: 200,
            machinery: 500,
            land: 50
        },
        finance: {
            debtRatio: 70,
            interestRate: 6.0,
            loanTerm: 10,
            taxRate: 20,
            opexInflation: 1.5,
            taxHoliday: 0
        },
        personnel: [
            // Management
            { category: 'Management', position: 'Managing Director', count: 0, salary: 100000, bonus: 1, increase: 3 },
            { category: 'Management', position: 'Administration Manager', count: 0, salary: 50000, bonus: 1, increase: 3 },
            { category: 'Management', position: 'Engineering & Env Manager', count: 0, salary: 80000, bonus: 1, increase: 3 },
            { category: 'Management', position: 'Operations Manager', count: 0, salary: 80000, bonus: 1, increase: 3 },
            { category: 'Management', position: 'Accounting & Finance Manager', count: 0, salary: 50000, bonus: 1, increase: 3 },

            // Technical
            { category: 'Technical', position: 'Engineer', count: 0, salary: 20000, bonus: 1, increase: 3 },
            { category: 'Technical', position: 'Safety Officer', count: 0, salary: 15000, bonus: 1, increase: 3 },
            { category: 'Technical', position: 'Environmental Officer', count: 0, salary: 15000, bonus: 1, increase: 3 },

            // HR
            { category: 'HR', position: 'HR Officer', count: 0, salary: 15000, bonus: 1, increase: 3 },

            // Finance
            { category: 'Finance', position: 'Purchasing Officer', count: 0, salary: 15000, bonus: 1, increase: 3 },
            { category: 'Finance', position: 'Accountant', count: 0, salary: 20000, bonus: 1, increase: 3 },
            { category: 'Finance', position: 'Finance Officer', count: 0, salary: 15000, bonus: 1, increase: 3 },

            // Others
            { category: 'Others', position: 'IT Officer', count: 0, salary: 25000, bonus: 1, increase: 3 },
            { category: 'Others', position: 'Store Officer', count: 0, salary: 15000, bonus: 1, increase: 3 },
            { category: 'Others', position: 'Community Relations', count: 0, salary: 15000, bonus: 1, increase: 3 },
            { category: 'Others', position: 'Security Guard', count: 0, salary: 15000, bonus: 1, increase: 3 },
            { category: 'Others', position: 'Cleaner', count: 0, salary: 10000, bonus: 1, increase: 3 },
            { category: 'Others', position: 'Gardener', count: 0, salary: 10000, bonus: 1, increase: 3 }
        ]
    },

    initialOpex: [
        { id: 1, name: 'Fuel Cost (RDF)', type: 'fixed', value: 0, quantity: 1, freqType: 'daily' },
        { id: 2, name: 'Water Supply', type: 'fixed', value: 12, quantity: 1000, freqType: 'daily' },
        { id: 3, name: 'Chemicals', type: 'fixed', value: 500000, quantity: 1, freqType: 'yearly' },
        { id: 4, name: 'Ash Disposal', type: 'fixed', value: 1000, quantity: 100, freqType: 'yearly' },
        { id: 5, name: 'Insurance', type: 'percent_const_mach', value: 0.5, quantity: 1, freqType: 'yearly' },
        { id: 6, name: 'Maintenance (Routine)', type: 'percent_machinery', value: 1.0, quantity: 1, freqType: 'yearly' },
        { id: 7, name: 'Major Overhaul', type: 'percent_machinery', value: 5.0, quantity: 1, freqType: 'every_n', customN: 5 }
    ]
};
