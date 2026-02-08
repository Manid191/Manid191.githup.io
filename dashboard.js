class DashboardManager {
    constructor() {
        this.container = document.getElementById('content-area');
        this.chartInstance = null;
    }

    render(results) {
        this.container.innerHTML = `
            <div class="dashboard-container">
                <div class="action-bar-top">
                    <button class="btn btn-secondary" onclick="window.inputApps.renderInputs()">
                        <i class="fa-solid fa-arrow-left"></i> Back to Inputs
                    </button>
                    <h2 class="result-title">Feasibility Results</h2>
                </div>

                <!-- KPI Cards -->
                <div class="kpi-grid">
                    <div class="kpi-card">
                        <div class="kpi-icon icon-npv"><i class="fa-solid fa-sack-dollar"></i></div>
                        <div class="kpi-content">
                            <span>Net Present Value (NPV)</span>
                            <h3 class="${results.npv >= 0 ? 'text-success' : 'text-danger'}">
                                ${this.formatCurrency(results.npv)}
                            </h3>
                        </div>
                    </div>
                    
                    <div class="kpi-card">
                        <div class="kpi-icon icon-irr"><i class="fa-solid fa-percent"></i></div>
                        <div class="kpi-content">
                            <span>Project IRR</span>
                            <h3 class="${results.irr >= 0.1 ? 'text-success' : 'text-warning'}">
                                ${results.irr.toFixed(2)} %
                            </h3>
                        </div>
                    </div>

                    <div class="kpi-card">
                        <div class="kpi-icon icon-irr"><i class="fa-solid fa-chart-line"></i></div>
                        <div class="kpi-content">
                            <span>Equity IRR (ROE)</span>
                            <h3 class="${results.irrEquity >= 0.1 ? 'text-success' : 'text-warning'}">
                                ${results.irrEquity.toFixed(2)} %
                            </h3>
                        </div>
                    </div>

                    <div class="kpi-card">
                        <div class="kpi-icon icon-lcoe"><i class="fa-solid fa-bolt"></i></div>
                        <div class="kpi-content">
                            <span>LCOE / Unit</span>
                            <h3>${results.lcoe.toFixed(2)} THB</h3>
                        </div>
                    </div>

                    <div class="kpi-card">
                        <div class="kpi-icon icon-payback"><i class="fa-solid fa-hourglass-half"></i></div>
                        <div class="kpi-content">
                            <span>Payback Period</span>
                            <h3>${results.payback.toFixed(2)} Years</h3>
                        </div>
                    </div>
                </div>

                <!-- Chart Section -->
                <div class="card glass-panel chart-panel">
                    <h3><i class="fa-solid fa-chart-bar"></i> Cash Flow Analysis</h3>
                    <div class="chart-container">
                        <canvas id="cashFlowChart"></canvas>
                    </div>
                </div>

                <!-- New Charts Row -->
                <div class="row" style="margin-top: 20px;">
                    <div class="card glass-panel col-item">
                        <h3><i class="fa-solid fa-chart-pie"></i> Expense Breakdown</h3>
                        <div class="chart-container" style="height: 300px;">
                            <canvas id="expenseChart"></canvas>
                        </div>
                    </div>
                    <div class="card glass-panel col-item">
                        <h3><i class="fa-solid fa-heart-pulse"></i> Financial Health (DSCR)</h3>
                        <div class="chart-container" style="height: 300px;">
                            <canvas id="dscrChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Detailed Table Section -->
                <div class="card glass-panel full-width" style="margin-top: 20px;">
                    <div class="card-header">
                         <h3><i class="fa-solid fa-table"></i> Detailed Cash Flow</h3>
                         <button class="btn btn-secondary btn-sm" onclick="document.getElementById('detail-table-wrapper').classList.toggle('hidden')">
                            Toggle View
                         </button>
                    </div>
                    <div id="detail-table-wrapper" class="hidden" style="overflow-x: auto; margin-top: 10px;">
                        <div id="detail-table-container"></div>
                    </div>
                </div>
            </div>
        `;

        // Wait for DOM then render chart
        requestAnimationFrame(() => {
            this.renderCharts(results);
            this.renderExpenseChart(results);
            this.renderDSCRChart(results);
            this.renderDetailTable(results);
        });
    }

    renderCharts(results) {
        const ctx = document.getElementById('cashFlowChart').getContext('2d');
        const labels = results.cashFlows.map((_, i) => `Year ${i}`);

        // Prepare Data
        // Year 0 is usually investment (-ve), Year 1+ is operation
        // For better visualization, we might split Capex and Operating Cash Flow

        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        this.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Project Cash Flow (Unlevered)',
                        data: results.cashFlows,
                        borderColor: 'rgb(54, 162, 235)', // Blue
                        backgroundColor: 'rgba(54, 162, 235, 0.1)',
                        borderWidth: 2,
                        tension: 0.1,
                        fill: false,
                        type: 'line',
                        order: 1
                    },
                    {
                        label: 'Fixed Cost',
                        data: results.details.annualFixedCost,
                        backgroundColor: 'rgba(255, 159, 64, 0.6)', // Orange
                        borderColor: 'rgba(255, 159, 64, 1)',
                        borderWidth: 1,
                        type: 'bar',
                        stack: 'costs',
                        order: 2
                    },
                    {
                        label: 'Variable Cost',
                        data: results.details.annualVariableCost,
                        backgroundColor: 'rgba(153, 102, 255, 0.6)', // Purple
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 1,
                        type: 'bar',
                        stack: 'costs',
                        order: 2
                    },
                    {
                        label: 'Finance Cost',
                        data: results.details.annualFinanceCost,
                        backgroundColor: 'rgba(201, 203, 207, 0.6)', // Grey
                        borderColor: 'rgba(201, 203, 207, 1)',
                        borderWidth: 1,
                        type: 'bar',
                        stack: 'costs',
                        order: 2
                    },
                    {
                        label: 'Cumulative Cash Flow',
                        data: results.cumulativeCashFlows,
                        borderColor: 'rgb(255, 99, 132)', // Red
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        tension: 0.1,
                        fill: false, // Changed to false to avoid overwhelming
                        type: 'line',
                        order: 0 // On Top
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#333'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += this.formatCurrency(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: false, // Allow negatives for CF
                        grid: {
                            color: '#e0e0e0'
                        },
                        ticks: {
                            color: '#333',
                            callback: (value) => {
                                if (Math.abs(value) >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                                return value;
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#333'
                        }
                    }
                }
            }
        });
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

    renderExpenseChart(results) {
        const ctx = document.getElementById('expenseChart').getContext('2d');
        const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

        const fixed = avg(results.details.annualFixedCost);
        const variable = avg(results.details.annualVariableCost);
        const finance = avg(results.details.annualFinanceCost);
        const tax = avg(results.details.annualTax);

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Fixed Opex', 'Variable Opex', 'Finance Cost', 'Corporate Tax'],
                datasets: [{
                    data: [fixed, variable, finance, tax],
                    backgroundColor: [
                        'rgba(255, 159, 64, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(201, 203, 207, 0.7)',
                        'rgba(255, 99, 132, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 159, 64, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(201, 203, 207, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right' },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const val = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const pct = ((val / total) * 100).toFixed(1) + '%';
                                return `${context.label}: ${this.formatCurrency(val)} (${pct})`;
                            }
                        }
                    }
                }
            }
        });
    }

    renderDSCRChart(results) {
        const ctx = document.getElementById('dscrChart').getContext('2d');
        const labels = results.cashFlows.map((_, i) => `Year ${i}`);
        const dscrData = results.details.annualDSCR.slice(1);
        const dscrLabels = labels.slice(1);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: dscrLabels,
                datasets: [{
                    label: 'DSCR',
                    data: dscrData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Ratio (x)' }
                    }
                },
                plugins: {
                    annotation: {
                        annotations: {
                            line1: {
                                type: 'line',
                                yMin: 1.2,
                                yMax: 1.2,
                                borderColor: 'red',
                                borderWidth: 2,
                                borderDash: [5, 5],
                                label: { content: 'Min DSCR (1.2x)', enabled: true }
                            }
                        }
                    }
                }
            }
        });
    }

    renderDetailTable(results) {
        const container = document.getElementById('detail-table-container');
        const years = Array.from({ length: results.inputs.projectYears }, (_, i) => i + 1);

        let html = `<table class="data-table small-text" style="width:100%">
            <thead>
                <tr>
                    <th style="min-width: 120px;">Item</th>
                    ${years.map(y => `<th>Y${y}</th>`).join('')}
                </tr>
            </thead>
            <tbody>`;

        const addRow = (label, dataArr) => {
            html += `<tr>
                <td style="font-weight:bold;">${label}</td>
                ${years.map(y => {
                const val = dataArr[y] || 0;
                return `<td>${(val / 1000000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>`;
            }).join('')}
            </tr>`;
        };

        addRow('Revenue', results.details.annualRevenue);
        addRow('OpEx (Fixed)', results.details.annualFixedCost);
        addRow('EBITDA', results.details.annualEbitda);
        addRow('Net Income', results.details.annualNetIncome);
        html += `<tr style="background:#f0f0f0; font-weight:bold;">
                 <td>Free Cash Flow</td>
                 ${years.map(y => {
            const val = results.cashFlows[y] || 0;
            return `<td>${(val / 1000000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>`;
        }).join('')}
                 </tr>`;

        html += `</tbody></table>`;
        container.innerHTML = html;
    }
}

window.dashboardApp = new DashboardManager();
