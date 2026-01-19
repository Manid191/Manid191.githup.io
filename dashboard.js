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
                            <h3>${results.payback.toFixed(1)} Years</h3>
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
            </div>
        `;

        // Wait for DOM then render chart
        requestAnimationFrame(() => this.renderCharts(results));
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
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Net Cash Flow',
                        data: results.cashFlows,
                        backgroundColor: results.cashFlows.map(v => v >= 0 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)'),
                        backgroundColor: results.cashFlows.map(v => v >= 0 ? 'rgba(75, 192, 192, 0.7)' : 'rgba(255, 99, 132, 0.7)'), // Corporate Green/Red
                        borderColor: results.cashFlows.map(v => v >= 0 ? 'rgb(75, 192, 192)' : 'rgb(255, 99, 132)'),
                        borderWidth: 1,
                        order: 2
                    },
                    {
                        label: 'Cumulative Cash Flow',
                        data: results.cumulativeCashFlows,
                        type: 'line',
                        borderColor: 'rgb(54, 162, 235)', // Corporate Blue
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderWidth: 2,
                        pointBackgroundColor: '#fff',
                        tension: 0.3,
                        order: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#333' // Dark legend text
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#e0e0e0' // Light gray grid
                        },
                        ticks: {
                            color: '#333' // Dark ticks
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
}

window.dashboardApp = new DashboardManager();
