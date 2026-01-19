class ReportManager {
    constructor() {
        this.container = document.getElementById('content-area');
    }

    render(inputs, results, sensitivity) {
        if (!inputs || !results) {
            this.container.innerHTML = `<div class="placeholder-state">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <h2>No Data Available</h2>
                <p>Please configure parameters and calculate first.</p>
            </div>`;
            return;
        }

        const date = new Date().toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Helper to format variation
        const fmtVar = (v) => (v > 0 ? `+${(v * 100).toFixed(0)}%` : `${(v * 100).toFixed(0)}%`);

        // Generate Sensitivity Rows (Price)
        const priceRows = sensitivity ? sensitivity.priceSensitivity.map(item => `
            <tr>
                <td>Electricity Price <span class="badge ${item.variation > 0 ? 'bg-success' : 'bg-warning'}">${fmtVar(item.variation)}</span></td>
                <td class="${item.irr >= 10 ? 'text-success' : 'text-danger'}"><strong>${item.irr.toFixed(2)}%</strong></td>
            </tr>
        `).join('') : '';

        // Generate Sensitivity Rows (Capex)
        const capexRows = sensitivity ? sensitivity.capexSensitivity.map(item => `
            <tr>
                <td>Total CAPEX <span class="badge ${item.variation > 0 ? 'bg-danger' : 'bg-success'}">${fmtVar(item.variation)}</span></td>
                <td class="${item.irr >= 10 ? 'text-success' : 'text-danger'}"><strong>${item.irr.toFixed(2)}%</strong></td>
            </tr>
        `).join('') : '';

        const cashFlowRows = results.cashFlows.map((cf, i) => `
            <tr>
                <td>Year ${i}</td>
                <td>${this.formatCurrency(results.inputs.opex ? (i === 0 ? results.inputs.capex.construction + results.inputs.capex.machinery + results.inputs.capex.land : 0) : 0)}</td>
                <!-- Simplified for display, real logic is in calculator.js. Let's just show Net Cash Flow -->
                <td class="${cf >= 0 ? '' : 'text-danger'}">${this.formatCurrency(cf)}</td>
                <td>${this.formatCurrency(results.cumulativeCashFlows[i])}</td>
            </tr>
        `).join('');

        this.container.innerHTML = `
            <div class="report-container fade-in">
                <div class="report-header">
                    <div>
                        <h2><i class="fa-solid fa-file-contract"></i> Feasibility Study Report</h2>
                        <p class="report-date">Generated on: ${date}</p>
                    </div>
                    <button class="btn btn-primary no-print" onclick="window.print()">
                        <i class="fa-solid fa-print"></i> Print / Save PDF
                    </button>
                </div>

                <div class="report-section">
                    <h3>1. Project Parameters</h3>
                    <div class="input-grid print-grid">
                        <div class="card">
                            <h4>Technical</h4>
                            <p><strong>Capacity:</strong> ${inputs.capacity} MW</p>
                            <p><strong>Project Duration:</strong> ${inputs.projectYears} Years</p>
                            <p><strong>Operating Hours:</strong> ${inputs.hoursPerDay} hrs/day</p>
                        </div>
                        <div class="card">
                            <h4>Financial Structure</h4>
                            <p><strong>Debt Ratio:</strong> ${inputs.finance.debtRatio}%</p>
                            <p><strong>Interest Rate:</strong> ${inputs.finance.interestRate}%</p>
                            <p><strong>Loan Term:</strong> ${inputs.finance.loanTerm} Years</p>
                        </div>
                        <div class="card">
                            <h4>Assumptions</h4>
                            <p><strong>Revenue Escalation:</strong> ${inputs.revenue.escalation}% / year</p>
                            <p><strong>Cost Inflation:</strong> ${inputs.finance.opexInflation}% / year</p>
                            <p><strong>Corporate Tax:</strong> ${inputs.finance.taxRate}%</p>
                        </div>
                    </div>
                </div>

                <div class="report-section">
                    <h3>2. Financial Summary</h3>
                    <div class="kpi-grid print-kpi">
                        <div class="kpi-card">
                            <div class="kpi-content">
                                <span>Project NPV</span>
                                <h3 class="${results.npv >= 0 ? 'text-success' : 'text-danger'}">${this.formatCurrency(results.npv)}</h3>
                            </div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-content">
                                <span>Project IRR</span>
                                <h3 class="${results.irr >= 0.1 ? 'text-success' : 'text-warning'}">${results.irr.toFixed(2)}%</h3>
                            </div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-content">
                                <span>Equity IRR (ROE)</span>
                                <h3 class="${results.irrEquity >= 0.1 ? 'text-success' : 'text-warning'}">${results.irrEquity.toFixed(2)}%</h3>
                            </div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-content">
                                <span>Payback</span>
                                <h3>${results.payback.toFixed(1)} Years</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="report-section">
                    <h3>3. Sensitivity Analysis (Equity IRR)</h3>
                    <div class="row">
                        <div class="card full-width">
                            <h4>Impact of Variations</h4>
                            <div class="table-responsive">
                                <table class="report-table">
                                    <thead>
                                        <tr>
                                            <th>Scenario</th>
                                            <th>Equity IRR (%)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr class="table-header"><td colspan="2" style="background:#f0f0f0; font-weight:bold;">Variation in Electricity Price</td></tr>
                                        ${priceRows}
                                        <tr class="table-header"><td colspan="2" style="background:#f0f0f0; font-weight:bold;">Variation in CAPEX</td></tr>
                                        ${capexRows}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 4. Debt Service Schedule -->
                <div class="report-section page-break">
                    <h3>4. Debt Repayment Calculation</h3>
                    <div class="table-responsive">
                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th>Year</th>
                                    <th>Beg. Balance</th>
                                    <th>Principal</th>
                                    <th>Interest</th>
                                    <th>Total Service</th>
                                    <th>Ending Balance</th>
                                    <th>DSCR</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.generateAmortizationRows(results.details, inputs.finance.loanTerm)}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="report-section">
                    <h3>5. Cash Flow Projection</h3>
                    <div class="table-responsive">
                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th>Year</th>
                                    <th>Investment (Ref)</th>
                                    <th>Net Cash Flow</th>
                                    <th>Cumulative</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${cashFlowRows} <!-- Showing all years might be too long, but user asked for report -->
                            </tbody>
                        </table>
                    </div>
                    <p class="text-muted text-sm">* Showing full project duration.</p>
                </div>
            </div>
        `;
    }

    formatCurrency(value) {
        if (Math.abs(value) >= 1000000) {
            return (value / 1000000).toLocaleString('th-TH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) + ' M THB';
        }
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            maximumFractionDigits: 0
        }).format(value);
    }
    generateAmortizationRows(details, loanTerm) {
        if (!details.annualLoanBalance) return '<tr><td colspan="7">No Debt Service Data</td></tr>';

        let html = '';
        // Loop up to loan term + 1 or until balance is 0? 
        // Or just show first N years? Loan Term is usually short (10-15).
        const len = Math.min(loanTerm + 2, details.annualLoanBalance.length);

        for (let i = 1; i < len; i++) {
            const begBal = details.annualLoanBalance[i];
            const prin = details.annualPrincipal[i];
            const int = details.annualInterest[i];
            const endBal = begBal - prin;
            const total = prin + int;
            const dscr = details.annualDSCR[i];

            if (begBal <= 0.1 && total <= 0.1) continue; // Skip empty years

            html += `
                <tr>
                    <td>Year ${i}</td>
                    <td>${this.formatCurrency(begBal)}</td>
                    <td>${this.formatCurrency(prin)}</td>
                    <td>${this.formatCurrency(int)}</td>
                    <td>${this.formatCurrency(total)}</td>
                    <td>${this.formatCurrency(endBal)}</td>
                    <td>${dscr === Infinity ? 'N/A' : dscr.toFixed(2) + 'x'}</td>
                </tr>
            `;
        }
        return html;
    }
}

window.reportApp = new ReportManager();
