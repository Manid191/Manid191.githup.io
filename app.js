document.addEventListener('DOMContentLoaded', () => {
    console.log('FeasibilityPro App Initialized');

    // --- Storage & Auto-save Logic ---
    // Load latest data if available
    const latestData = StorageManager.loadLatestProject();
    if (latestData) {
        console.log('Loaded previous session data:', latestData);
        // Initial View with data
        window.inputApps.renderInputs();
        // Restore State
        setTimeout(() => {
            window.inputApps.setState(latestData);
            window.inputApps.calculate();
        }, 100); // Small delay to ensure DOM is ready
    } else {
        // Initial View
        window.inputApps.renderInputs();
    }

    // Debounce Utility
    const debounce = (func, wait) => {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    // Auto-Save Trigger
    window.autoSaveTrigger = () => {
        const activeView = document.querySelector('.nav-item.active')?.getAttribute('data-view') || 'dashboard';

        // Mock State Collection - In real implementation, this collects all inputs
        const currentState = {
            view: activeView,
            lastModified: new Date().toISOString(),
            inputs: window.inputApps.getInputs()
        };

        StorageManager.saveProject(currentState);
    };

    // Attach Auto-save to all relevant events (Input changes for now)
    // We use a long debounce (1s) to avoid saving every keystroke immediately
    document.addEventListener('input', debounce(window.autoSaveTrigger, 1000));
    document.addEventListener('change', debounce(window.autoSaveTrigger, 1000));

    // Simple Navigation Handling
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // Fix: Force save if leaving "inputs" view to prevent data loss
            const currentActive = document.querySelector('.nav-item.active');
            if (currentActive && currentActive.getAttribute('data-view') === 'inputs') {
                try {
                    const inputs = window.inputApps.getInputs();
                    const state = {
                        view: 'inputs',
                        lastModified: new Date().toISOString(),
                        inputs: inputs
                    };
                    StorageManager.saveProject(state);
                    console.log('State forced saved before navigation');
                } catch (err) {
                    console.warn('Could not save state on navigation:', err);
                }
            }

            // Remove active class from all
            navItems.forEach(nav => nav.classList.remove('active'));

            // Add to clicked
            item.classList.add('active');

            // Update Header (Simulation)
            const viewName = item.getAttribute('data-view');
            updateHeader(viewName);

            // View Routing
            if (viewName === 'inputs') {
                // Capture current state before DOM is wiped by renderInputs
                // We try to get inputs from the active view if possible, or fallback to storage
                let currentInputs = null;

                // If we are coming entirely from another view (e.g. Dashboard), getInputs might fail if DOM elements aren't there?
                // Actually `getInputs` relies on `document.getElementById`.
                // If we are in Dashboard, those IDs don't exist! `input_manager.js` checks DOM.
                // So if we are in Dashboard, `getInputs` returns garbage or errors.

                // Fortunatelly, StorageManager has the latest auto-saved state.
                // And since we autosave on input change, and navigating doesn't change input...
                // But wait, what if I type and click "Dashboard" immediately? Auto-save debounce (1000ms) might not have fired.
                // We should trigger a save before switching views?
                // `updateHeader` is called.

                // Let's force a save or capture when *leaving* a view? 
                // Too complex for this cleanup.

                // Best bet: Load from Storage. 
                // If the user is quick, they might lose 1 second of work. 
                // Let's rely on StorageManager.loadLatestProject() as the primary restoration source when returning to Inputs.
                // But to be safer, we can try to force-save-if-dirty logic?
                // Let's just trust the AutoSave trigger on 'input' event.

                window.inputApps.renderInputs();

                const latest = StorageManager.loadLatestProject();
                if (latest) {
                    window.inputApps.setState(latest);
                }

            } else if (viewName === 'dashboard') {
                window.inputApps.calculate();
            } else if (viewName === 'financials') {
                // Calculate silently (isSimulation=true) to get results without auto-rendering dashboard
                const results = window.inputApps.calculate(null, true);
                if (window.financialApp) {
                    window.financialApp.render(results);
                }
            } else if (viewName === 'report') {
                const inputs = window.inputApps.getInputs();
                const results = window.inputApps.calculate();
                const sensitivity = window.inputApps.runSensitivityAnalysis();

                // Render Report using the results from calculate()
                if (window.reportApp) {
                    window.reportApp.render(inputs, results, sensitivity);
                }
            }
        });
    });

    // Export Button Logic
    const exportBtn = document.querySelector('.btn-secondary');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const data = {
                inputs: window.inputApps.getInputs(),
                metadata: {
                    version: '1.0',
                    exportedAt: new Date().toISOString()
                }
            };

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", "feasibility_project.json");
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        });
    }
});

function updateHeader(viewName) {
    const titleMap = {
        'dashboard': { title: 'Dashboard', sub: 'Overview of your power plant feasibility study' },
        'inputs': { title: 'Parameters', sub: 'Configure technical and financial assumptions' },
        'financials': { title: 'Financial Models', sub: 'Detailed cash flow and ratios' },
        'report': { title: 'Report', sub: 'Generate and export PDF reports' }
    };

    const header = document.getElementById('page-header');
    const subtitle = document.querySelector('.subtitle');

    if (titleMap[viewName]) {
        header.textContent = titleMap[viewName].title;
        subtitle.textContent = titleMap[viewName].sub;
    }
}
