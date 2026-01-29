class InputManager {
    constructor() {
        this.container = document.getElementById('content-area');

        // Load Defaults from Config or fallback
        const defaults = (window.AppConfig && window.AppConfig.defaults) ? window.AppConfig.defaults : {};
        const initialOpex = (window.AppConfig && window.AppConfig.initialOpex) ? window.AppConfig.initialOpex : [];

        // Initialize with defaults to support calculation without rendering
        this.currentInputs = JSON.parse(JSON.stringify(defaults)); // Deep Copy

        // Safety Fallback if config failed
        if (Object.keys(this.currentInputs).length === 0) {
            console.warn("Config not loaded, using hardcoded fallback.");
            this.currentInputs = {
                capacity: 10, projectYears: 25, powerFactor: 0.95, hoursPerDay: 24,
                revenue: { peakRate: 4.5, peakHours: 13, offPeakRate: 2.6, escalation: 0, adderPrice: 0, adderYears: 7 },
                degradation: 0.5,
                capex: { construction: 20, machinery: 50, land: 10 },
                finance: { debtRatio: 70, interestRate: 5.0, loanTerm: 10, taxRate: 20, opexInflation: 1.5, taxHoliday: 0 },
            };
        }

        this.state = {
            opexItems: JSON.parse(JSON.stringify(initialOpex))
        };
    }

    renderInputs() {
        this.container.innerHTML = `
            <div class="three-column-layout">
                
                <!-- 1. CAPEX (Investment) -->
                <div class="card glass-panel col-item">
                    <h3><i class="fa-solid fa-coins"></i> CAPEX</h3>
                    
                    <div class="form-group">
                        <label>Construction (M)</label>
                        <input type="number" id="costConstruction" value="${this.currentInputs.capex.construction}">
                    </div>

                    <div class="form-group">
                        <label>Machinery (M)</label>
                        <input type="number" id="costMachinery" value="${this.currentInputs.capex.machinery}">
                    </div>

                    <div class="form-group">
                        <label>Land (M)</label>
                        <input type="number" id="costLand" value="${this.currentInputs.capex.land}">
                    </div>

                    <div class="total-display compact">
                        <span>Total:</span>
                        <span id="totalCapex" class="highlight">0 M</span>
                    </div>
                </div>

                <!-- 2. Technical & Revenue -->
                <div class="card glass-panel col-item">
                    <h3><i class="fa-solid fa-bolt"></i> Technical & Revenue</h3>
                    
                    <div class="row">
                        <div class="form-group">
                            <label>Capacity (MW)</label>
                            <input type="number" id="capacity" value="${this.currentInputs.capacity}" step="0.1">
                        </div>
                        <div class="form-group">
                            <label>Duration (Yrs)</label>
                            <input type="number" id="projectYears" value="${this.currentInputs.projectYears}" min="10" max="30">
                        </div>
                    </div>

                    <div class="row">
                        <div class="form-group">
                            <label>Power Factor</label>
                            <input type="number" id="powerFactor" value="${this.currentInputs.powerFactor}" step="0.01" max="1">
                        </div>
                        <div class="form-group">
                            <label>Hrs/Day</label>
                            <input type="number" id="hoursPerDay" value="${this.currentInputs.hoursPerDay}" max="24">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Degradation (%)</label>
                        <input type="number" id="degradation" value="${this.currentInputs.degradation || 0}" step="0.1">
                    </div>

                    <div class="divider"></div>
                    
                    <div class="row">
                        <div class="form-group">
                            <label>Peak Rate</label>
                            <input type="number" id="pricePeak" value="${this.currentInputs.revenue.peakRate}">
                        </div>
                        <div class="form-group">
                            <label>Peak Hrs</label>
                            <input type="number" id="hoursPeak" value="${this.currentInputs.revenue.peakHours}">
                        </div>
                    </div>

                    <div class="row">
                        <div class="form-group">
                            <label>Off-Peak Rate</label>
                            <input type="number" id="priceOffPeak" value="${this.currentInputs.revenue.offPeakRate}">
                        </div>
                        <div class="form-group">
                            <label>Escalation %</label>
                            <input type="number" id="revenueEscalation" value="${this.currentInputs.revenue.escalation}" step="0.1">
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="form-group">
                            <label>Adder</label>
                            <input type="number" id="adderPrice" value="${this.currentInputs.revenue.adderPrice || 0}" step="0.01">
                        </div>
                        <div class="form-group">
                            <label>Adder Yrs</label>
                            <input type="number" id="adderYears" value="${this.currentInputs.revenue.adderYears || 0}">
                        </div>
                    </div>
                </div>

                <!-- 3. Financial Structure -->
            <div class="card glass-panel col-item">
                <h3><i class="fa-solid fa-building-columns"></i> Financial Structure</h3>

                <div class="form-group">
                    <label>Debt Ratio (%)</label>
                    <input type="number" id="debtRatio" value="${this.currentInputs.finance.debtRatio}" max="100">
                </div>

                <div class="row">
                    <div class="form-group">
                        <label>Interest %</label>
                        <input type="number" id="interestRate" value="${this.currentInputs.finance.interestRate}" step="0.1">
                    </div>
                    <div class="form-group">
                        <label>Loan Term</label>
                        <input type="number" id="loanTerm" value="${this.currentInputs.finance.loanTerm}">
                    </div>
                </div>

                <div class="row">
                    <div class="form-group">
                        <label>Corp Tax %</label>
                        <input type="number" id="taxRate" value="${this.currentInputs.finance.taxRate}">
                    </div>
                    <div class="form-group">
                        <label>Cost Inf %</label>
                        <input type="number" id="opexInflation" value="${this.currentInputs.finance.opexInflation}" step="0.1">
                    </div>
                </div>
                <div class="form-group">
                    <label>Tax Holiday (Yrs)</label>
                    <input type="number" id="taxHoliday" value="${this.currentInputs.finance.taxHoliday || 0}">
                </div>

                <div class="action-spacer" style="margin-top: auto; padding-top: 20px;">
                    <button class="btn btn-primary full-width-btn" onclick="inputApps.userTriggerCalculate()">
                        <i class="fa-solid fa-calculator"></i> Calculate
                    </button>
                </div>
            </div>

            </div>

            <!-- OPEX Section (Full row below) -->
            <div class="card glass-panel full-width" style="margin-top: 16px;">
                <div class="card-header">
                    <h3><i class="fa-solid fa-screwdriver-wrench"></i> OPEX (Operation Cost)</h3>
                    <button class="btn btn-primary btn-sm" onclick="inputApps.addOpexItem()">
                        <i class="fa-solid fa-plus"></i> Add Item
                    </button>
                </div>

                <div id="opex-list" class="opex-container">
                    <!-- Items injected here -->
                </div>
            </div>
        `;

        this.updateCapexTotal();
        this.renderOpexList();
        this.attachListeners();
    }

    resetToDefaults() {
        if (confirm("Are you sure you want to reset all inputs to defaults? This will clear your saved data.")) {
            if (window.StorageManager && typeof window.StorageManager.deleteAllSaves === 'function') {
                window.StorageManager.deleteAllSaves();
            } else {
                console.warn("StorageManager.deleteAllSaves not found");
                // Attempt manual cleanup based on prefix
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('feasibility_project_')) {
                        localStorage.removeItem(key);
                    }
                }
            }
            window.location.reload();
        }
    }

    renderOpexList() {
        const list = document.getElementById('opex-list');
        if (!list) return;
        list.innerHTML = '';

        this.state.opexItems.forEach((item, index) => {
            const html = `
                <div class="opex-item compact-row">
                    <input type="text" class="input-compact grow-2" placeholder="Item Name" 
                           value="${item.name}" onchange="inputApps.updateOpex(${index}, 'name', this.value)" title="Expense Name">
                    
                    <select class="input-compact grow-1" onchange="inputApps.updateOpex(${index}, 'type', this.value)" title="Cost Type">
                        <option value="fixed" ${item.type === 'fixed' ? 'selected' : ''}>Fixed (THB)</option>
                        <option value="per_mw" ${item.type === 'per_mw' ? 'selected' : ''}>THB / MW</option>
                        <option value="percent_capex" ${item.type === 'percent_capex' ? 'selected' : ''}>% CAPEX</option>
                    </select>

                    <input type="text" class="input-compact grow-1" placeholder="Value (e.g. 50*12)" 
                           value="${item.value}" onchange="inputApps.handleOpexValueChange(${index}, this)" title="Annual Value">

                    <select class="input-compact grow-1" onchange="inputApps.updateOpex(${index}, 'frequency', parseInt(this.value))" title="Frequency">
                        <option value="1" ${item.frequency === 1 ? 'selected' : ''}>Every Year</option>
                        <option value="3" ${item.frequency === 3 ? 'selected' : ''}>Every 3 Years</option>
                        <option value="5" ${item.frequency === 5 ? 'selected' : ''}>Every 5 Years</option>
                    </select>

                    <button class="btn btn-danger btn-icon btn-sm" onclick="inputApps.removeOpex(${index})" title="Remove">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
            `;
            list.insertAdjacentHTML('beforeend', html);
        });
    }

    handleOpexValueChange(index, inputElement) {
        let valueStr = inputElement.value;
        // Allow numbers, math operators, decimals, and spaces
        if (/^[0-9+\-*/().\s]+$/.test(valueStr)) {
            try {
                // Safe evaluation
                const result = Function('"use strict";return (' + valueStr + ')')();
                if (isFinite(result)) {
                    inputElement.value = result; // Update UI with calculated result
                    this.updateOpex(index, 'value', parseFloat(result));
                    return;
                }
            } catch (e) {
                console.warn("Invalid math expression", e);
            }
        }

        // Fallback or if already a number
        const num = parseFloat(valueStr);
        if (!isNaN(num)) {
            this.updateOpex(index, 'value', num);
        } else {
            // Reset if invalid
            inputElement.value = this.state.opexItems[index].value || 0;
            alert("Invalid input. Please enter a number or a simple math expression (e.g. 50*12).");
        }
    }

    addOpexItem() {
        this.state.opexItems.push({
            id: Date.now(),
            name: 'New Expense',
            type: 'fixed',
            value: 0,
            frequency: 1
        });
        this.renderOpexList();
    }

    removeOpex(index) {
        this.state.opexItems.splice(index, 1);
        this.renderOpexList();
    }

    updateOpex(index, field, value) {
        this.state.opexItems[index][field] = value;
    }

    attachListeners() {
        // Auto-calculate CAPEX total
        const capexInputs = ['costConstruction', 'costMachinery', 'costLand'];
        capexInputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', () => this.updateCapexTotal());
        });
    }

    updateCapexTotal() {
        if (!document.getElementById('costConstruction')) return;
        const construction = parseFloat(document.getElementById('costConstruction').value) || 0;
        const machinery = parseFloat(document.getElementById('costMachinery').value) || 0;
        const land = parseFloat(document.getElementById('costLand').value) || 0;
        const total = construction + machinery + land;

        const totalEl = document.getElementById('totalCapex');
        if (totalEl) totalEl.textContent = total.toLocaleString() + ' M THB';
        return total;
    }

    getInputs() {
        // If inputs are in DOM, update state. If not, return state.
        const capEl = document.getElementById('capacity');
        if (capEl) {
            // DOM is present, scrape it
            this.currentInputs = {
                capacity: parseFloat(document.getElementById('capacity').value) || 0,
                projectYears: parseInt(document.getElementById('projectYears').value) || 25,
                powerFactor: parseFloat(document.getElementById('powerFactor').value) || 1,
                hoursPerDay: parseFloat(document.getElementById('hoursPerDay').value) || 24,
                degradation: parseFloat(document.getElementById('degradation').value) || 0,

                revenue: {
                    peakRate: parseFloat(document.getElementById('pricePeak').value) || 0,
                    peakHours: parseFloat(document.getElementById('hoursPeak').value) || 0,
                    offPeakRate: parseFloat(document.getElementById('priceOffPeak').value) || 0,
                    escalation: parseFloat(document.getElementById('revenueEscalation').value) || 0,
                    adderPrice: parseFloat(document.getElementById('adderPrice').value) || 0,
                    adderYears: parseFloat(document.getElementById('adderYears').value) || 0,
                },

                capex: {
                    construction: (parseFloat(document.getElementById('costConstruction').value) || 0) * 1000000,
                    machinery: (parseFloat(document.getElementById('costMachinery').value) || 0) * 1000000,
                    land: (parseFloat(document.getElementById('costLand').value) || 0) * 1000000
                },

                finance: {
                    debtRatio: parseFloat(document.getElementById('debtRatio').value) || 0,
                    interestRate: parseFloat(document.getElementById('interestRate').value) || 0,
                    loanTerm: parseInt(document.getElementById('loanTerm').value) || 0,
                    taxRate: parseFloat(document.getElementById('taxRate').value) || 0,
                    opexInflation: parseFloat(document.getElementById('opexInflation').value) || 0,
                    taxHoliday: parseInt(document.getElementById('taxHoliday').value) || 0
                }
            };
        }

        // Return full object state
        return {
            ...this.currentInputs,
            opex: this.state.opexItems
        };
    }

    setState(data) {
        if (!data || !data.inputs) {
            console.warn("Invalid data for setState");
            return;
        }

        const inputs = data.inputs;

        // Sync Memory
        this.currentInputs = {
            ...this.currentInputs,
            ...inputs,
            revenue: { ...this.currentInputs.revenue, ...(inputs.revenue || {}) },
            capex: { ...this.currentInputs.capex, ...(inputs.capex || {}) },
            finance: { ...this.currentInputs.finance, ...(inputs.finance || {}) }
        };

        // Sync OPEX
        if (inputs.opex && Array.isArray(inputs.opex)) {
            this.state.opexItems = inputs.opex;
        }

        // Sync DOM if exists
        const capEl = document.getElementById('capacity');
        if (capEl) {
            if (inputs.capacity) document.getElementById('capacity').value = inputs.capacity;
            if (inputs.projectYears) document.getElementById('projectYears').value = inputs.projectYears;
            if (inputs.powerFactor) document.getElementById('powerFactor').value = inputs.powerFactor;
            if (inputs.hoursPerDay) document.getElementById('hoursPerDay').value = inputs.hoursPerDay;
            if (inputs.degradation !== undefined) document.getElementById('degradation').value = inputs.degradation;

            if (inputs.revenue) {
                if (inputs.revenue.peakRate) document.getElementById('pricePeak').value = inputs.revenue.peakRate;
                if (inputs.revenue.peakHours) document.getElementById('hoursPeak').value = inputs.revenue.peakHours;
                if (inputs.revenue.offPeakRate) document.getElementById('priceOffPeak').value = inputs.revenue.offPeakRate;
                if (inputs.revenue.escalation !== undefined) document.getElementById('revenueEscalation').value = inputs.revenue.escalation;
                if (inputs.revenue.adderPrice !== undefined) document.getElementById('adderPrice').value = inputs.revenue.adderPrice;
                if (inputs.revenue.adderYears !== undefined) document.getElementById('adderYears').value = inputs.revenue.adderYears;
            }

            // CAPEX (Convert back to Millions for display)
            if (inputs.capex) {
                if (inputs.capex.construction) document.getElementById('costConstruction').value = inputs.capex.construction / 1000000;
                if (inputs.capex.machinery) document.getElementById('costMachinery').value = inputs.capex.machinery / 1000000;
                if (inputs.capex.land) document.getElementById('costLand').value = inputs.capex.land / 1000000;
            }

            // Financial
            if (inputs.finance) {
                if (inputs.finance.debtRatio !== undefined) document.getElementById('debtRatio').value = inputs.finance.debtRatio;
                if (inputs.finance.interestRate !== undefined) document.getElementById('interestRate').value = inputs.finance.interestRate;
                if (inputs.finance.loanTerm) document.getElementById('loanTerm').value = inputs.finance.loanTerm;
                if (inputs.finance.taxRate !== undefined) document.getElementById('taxRate').value = inputs.finance.taxRate;
                if (inputs.finance.opexInflation !== undefined) document.getElementById('opexInflation').value = inputs.finance.opexInflation;
                if (inputs.finance.taxHoliday !== undefined) document.getElementById('taxHoliday').value = inputs.finance.taxHoliday;
            }

            this.renderOpexList();
            this.updateCapexTotal();
        }
    }

    calculate(customInputs = null, isSimulation = false) {
        const inputs = customInputs || this.getInputs();

        // --- 1. Generate Parameters ---
        const projectYears = inputs.projectYears || 25;
        const discountRate = 0.07;

        // Finance Params
        const totalCapex = inputs.capex.construction + inputs.capex.machinery + inputs.capex.land;
        const debtRatio = (inputs.finance.debtRatio || 0) / 100;
        const loanAmount = totalCapex * debtRatio;
        const equityAmount = totalCapex - loanAmount;

        const interestRate = (inputs.finance.interestRate || 0) / 100;
        const loanTerm = inputs.finance.loanTerm || 10;
        const annualDebtService = FinancialCalculator.pmt(interestRate, loanTerm, loanAmount);

        const taxRate = (inputs.finance.taxRate || 0) / 100;
        const revenueEscalation = (inputs.revenue.escalation || 0) / 100;
        const opexInflation = (inputs.finance.opexInflation || 0) / 100;
        const taxHoliday = inputs.finance.taxHoliday || 0;
        const degradationRate = (inputs.degradation || 0) / 100;

        // Adder Params
        const adderPrice = inputs.revenue.adderPrice || 0;
        const adderYears = inputs.revenue.adderYears || 0;

        // Depreciation (Straight Line)
        const depreciableAsset = inputs.capex.construction + inputs.capex.machinery;
        const annualDepreciation = depreciableAsset / projectYears;

        // --- 2. Calculate Annual Revenue ---
        const capacityKW = inputs.capacity * 1000;
        const dailyEnergyPeak = capacityKW * (inputs.revenue.peakHours * inputs.powerFactor);
        const dailyEnergyOffPeak = capacityKW * ((inputs.hoursPerDay - inputs.revenue.peakHours) * inputs.powerFactor);
        const totalAnnualEnergy = (dailyEnergyPeak + dailyEnergyOffPeak) * 365;

        const annualGenPeak = dailyEnergyPeak * 365;
        const annualGenOffPeak = dailyEnergyOffPeak * 365;
        const baseAnnualRevenue = (annualGenPeak * inputs.revenue.peakRate) + (annualGenOffPeak * inputs.revenue.offPeakRate);

        // --- 4. Generate Cash Flow Array ---
        let projectCashFlows = new Array(projectYears + 1).fill(0);
        let equityCashFlows = new Array(projectYears + 1).fill(0);
        let costsArray = new Array(projectYears + 1).fill(0);
        let energyArray = new Array(projectYears + 1).fill(0);

        // Detailed Arrays
        let annualRevenue = new Array(projectYears + 1).fill(0);
        let annualOpex = new Array(projectYears + 1).fill(0);
        let annualEbitda = new Array(projectYears + 1).fill(0);
        let annualDepreciationArr = new Array(projectYears + 1).fill(0);
        let annualEbit = new Array(projectYears + 1).fill(0);
        let annualInterest = new Array(projectYears + 1).fill(0);
        let annualTax = new Array(projectYears + 1).fill(0);
        let annualNetIncome = new Array(projectYears + 1).fill(0);
        let annualPrincipal = new Array(projectYears + 1).fill(0);

        // Itemized OPEX tracking: Array of objects { "Item Name": cost, ... }
        let annualItemizedOpex = new Array(projectYears + 1).fill(null);

        // Year 0
        projectCashFlows[0] = -totalCapex;
        costsArray[0] = totalCapex;
        equityCashFlows[0] = -equityAmount;
        annualItemizedOpex[0] = {}; // No OPEX in year 0 usually

        // Debt Service Arrays
        let annualLoanBalance = new Array(projectYears + 1).fill(0);
        let annualDSCR = new Array(projectYears + 1).fill(0);

        // Loop
        let currentLoanBalance = loanAmount;

        for (let year = 1; year <= projectYears; year++) {
            const escalationFactor = Math.pow(1 + revenueEscalation, year - 1);
            const inflationFactor = Math.pow(1 + opexInflation, year - 1);
            const degradationFactor = Math.pow(1 - degradationRate, year - 1);

            const yearBaseRevenue = baseAnnualRevenue * escalationFactor * degradationFactor;
            const yearAdderRevenue = (year <= adderYears) ? (totalAnnualEnergy * degradationFactor * adderPrice) : 0;

            const yearRevenue = yearBaseRevenue + yearAdderRevenue;
            annualRevenue[year] = yearRevenue;

            let yearOpex = 0;
            let yearItemized = {};

            inputs.opex.forEach(item => {
                let isDue = false;
                if (item.frequency === 1) isDue = true;
                else if (year % item.frequency === 0) isDue = true;

                let cost = 0;
                if (isDue) {
                    if (item.type === 'fixed') cost = item.value;
                    else if (item.type === 'per_mw') cost = item.value * inputs.capacity;
                    else if (item.type === 'percent_capex') cost = (item.value / 100) * totalCapex;
                    cost = cost * inflationFactor;
                }

                yearOpex += cost;
                yearItemized[item.name] = cost;
            });

            annualOpex[year] = yearOpex;
            annualItemizedOpex[year] = yearItemized;

            // Financials
            const ebitda = yearRevenue - yearOpex;
            annualEbitda[year] = ebitda;

            const ebit = ebitda - annualDepreciation;
            annualDepreciationArr[year] = annualDepreciation;
            annualEbit[year] = ebit;

            // Interest & Principal
            let interestExp = 0;
            let principalRepay = 0;

            if (year <= loanTerm && currentLoanBalance > 0) {
                // Beginning Balance for this year
                annualLoanBalance[year] = currentLoanBalance;

                interestExp = currentLoanBalance * interestRate;
                const payment = annualDebtService;
                principalRepay = payment - interestExp;
                if (principalRepay > currentLoanBalance) principalRepay = currentLoanBalance;

                // End Balance
                currentLoanBalance -= principalRepay;
                if (currentLoanBalance < 0) currentLoanBalance = 0;
            }
            annualInterest[year] = interestExp;
            annualPrincipal[year] = principalRepay;

            // Tax
            const ebt = ebit - interestExp;

            // Apply Tax Holiday Logic
            let effectiveTaxRate = taxRate;
            if (year <= taxHoliday) {
                effectiveTaxRate = 0;
            }

            const tax = (ebt > 0) ? ebt * effectiveTaxRate : 0;
            annualTax[year] = tax;

            // Net Income
            const netIncome = ebt - tax;
            annualNetIncome[year] = netIncome;

            // Cash Flows
            const equityCF = netIncome + annualDepreciation - principalRepay;
            equityCashFlows[year] = equityCF;

            const unleveredTax = (ebit > 0) ? ebit * effectiveTaxRate : 0;
            const unleveredCF = ebitda - unleveredTax;
            projectCashFlows[year] = unleveredCF;


            // DSCR Calculation
            // DSCR = (EBITDA - Tax) / Debt Service (Principal + Interest)
            // Note: Some definitions use CFADS (Cash Flow Available for Debt Service)
            const debtService = principalRepay + interestExp;
            if (debtService > 0) {
                // Simplified CFADS = EBITDA - Tax (assuming tax is paid before debt service?? No, Tax is after Interest)
                // Actually standard DSCR = (EBITDA - Tax) / (Principal + Interest) is common but Tax validity depends on EBT which depends on Interest.
                // Let's use Operating CF (Net Income + Depreciation + Interest) ? 
                // Let's use: CFADS = EBITDA - Tax Paid
                const cfads = ebitda - tax;
                annualDSCR[year] = cfads / debtService;
            } else {
                annualDSCR[year] = 0; // No debt service
            }

            costsArray[year] = yearOpex;
            energyArray[year] = totalAnnualEnergy * Math.pow(1 - degradationRate, year - 1);
        }

        // --- 5. Metrics ---
        const npv = FinancialCalculator.npv(discountRate, projectCashFlows);
        let irr = FinancialCalculator.irr(projectCashFlows);
        if (isNaN(irr)) irr = 0;
        irr *= 100;

        let irrEquity = FinancialCalculator.irr(equityCashFlows);
        if (isNaN(irrEquity)) irrEquity = 0;
        irrEquity *= 100;

        const npvEquity = FinancialCalculator.npv(0.10, equityCashFlows);
        const lcoe = FinancialCalculator.lcoe(discountRate, costsArray, energyArray);
        const payback = FinancialCalculator.paybackPeriod(projectCashFlows);

        let cumulative = 0;
        const cumulativeCashFlows = projectCashFlows.map(cf => {
            cumulative += cf;
            return cumulative;
        });

        const results = {
            npv, irr, npvEquity, irrEquity, lcoe, payback,
            cashFlows: projectCashFlows,
            equityCashFlows,
            cumulativeCashFlows,
            inputs,
            details: {
                annualRevenue, annualOpex, annualItemizedOpex,
                annualEbitda, annualDepreciation: annualDepreciationArr,
                annualEbit, annualInterest, annualPrincipal, annualTax, annualNetIncome,
                annualLoanBalance, annualDSCR
            }
        };

        if (!isSimulation) {
            if (window.dashboardApp) {
                window.dashboardApp.render(results);
            } else {
                console.warn("Dashboard App not initialized yet");
            }
        }

        return results;
    }

    userTriggerCalculate() {
        // Mark that a calculation has been done
        window.hasCalculated = true;

        // Force save state
        const state = {
            view: 'inputs',
            lastModified: new Date().toISOString(),
            inputs: this.getInputs()
        };
        if (window.StorageManager) {
            window.StorageManager.saveProject(state);
        }

        // Do the calculation
        this.calculate();

        // Navigate to Dashboard (simulate click)
        const dashNav = document.querySelector('.nav-item[data-view="dashboard"]');
        if (dashNav) {
            dashNav.click();
        }
    }

    runSensitivityAnalysis() {
        const baseInputs = this.getInputs();
        const variations = [-0.2, -0.1, 0, 0.1, 0.2];
        const results = {};

        results.priceSensitivity = variations.map(v => {
            const simInputs = JSON.parse(JSON.stringify(baseInputs));
            simInputs.revenue.peakRate = baseInputs.revenue.peakRate * (1 + v);
            simInputs.revenue.offPeakRate = baseInputs.revenue.offPeakRate * (1 + v);
            const res = this.calculate(simInputs, true);
            return { variation: v, irr: res.irrEquity };
        });

        results.capexSensitivity = variations.map(v => {
            const simInputs = JSON.parse(JSON.stringify(baseInputs));
            simInputs.capex.construction = baseInputs.capex.construction * (1 + v);
            simInputs.capex.machinery = baseInputs.capex.machinery * (1 + v);
            simInputs.capex.land = baseInputs.capex.land * (1 + v);
            const res = this.calculate(simInputs, true);
            return { variation: v, irr: res.irrEquity };
        });

        return results;
    }

    exportScenario() {
        const data = {
            inputs: this.getInputs(),
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `scenario_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importScenario(inputElement) {
        const file = inputElement.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data && data.inputs) {
                    this.setState({ inputs: data.inputs });
                    alert('Scenario imported successfully!');
                    this.userTriggerCalculate();
                } else {
                    alert('Invalid scenario file format.');
                }
            } catch (err) {
                console.error(err);
                alert('Error reading file.');
            }
            // Reset input so same file can be selected again if needed
            inputElement.value = '';
        };
        reader.readAsText(file);
    }
}

// Global instance
window.inputApps = new InputManager();
