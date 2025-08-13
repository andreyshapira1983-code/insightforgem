/**
 * Star Galaxy Core - Orchestrator Script
 * 
 * This script serves as the central nervous system for Star Galaxy,
 * coordinating all other scripts, handling dependencies, and providing
 * fallback mechanisms if components fail.
 */

// Immediately-invoked function expression to avoid polluting global scope
(function() {
    // Core system state
    const StarGalaxy = {
        // System status
        status: {
            initialized: false,
            loadedScripts: {},
            failedScripts: {},
            componentStatus: {}
        },
        
        // Configuration
        config: {
            debug: true,
            gracefulDegradation: true,
            retryFailedScripts: true,
            maxRetries: 2,
            scriptTimeout: 5000, // ms
            dependencies: {
                'app.js': ['galaxy-bg.js', 'security.js', 'auth.js', 'idea-privacy.js'],
                'auth.js': ['security.js'],
                'idea-privacy.js': ['security.js'],
                'analyzeWithAI.js': ['app.js']
                // Add more dependencies as needed
            }
        },
        
        // Core API that will be exposed to other scripts
        api: {
            // Event system for inter-script communication
            events: {
                listeners: {},
                
                on: function(event, callback) {
                    if (!this.listeners[event]) {
                        this.listeners[event] = [];
                    }
                    this.listeners[event].push(callback);
                    return this; // For chaining
                },
                
                off: function(event, callback) {
                    if (!this.listeners[event]) return this;
                    
                    if (callback) {
                        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
                    } else {
                        delete this.listeners[event];
                    }
                    return this;
                },
                
                emit: function(event, data) {
                    StarGalaxy.log(`Event emitted: ${event}`, data);
                    
                    if (!this.listeners[event]) return;
                    
                    this.listeners[event].forEach(callback => {
                        try {
                            callback(data);
                        } catch (e) {
                            StarGalaxy.error(`Error in event listener for ${event}:`, e);
                        }
                    });
                    return this;
                }
            },
            
            // State management for sharing data between scripts
            state: {
                data: {},
                
                get: function(key) {
                    return this.data[key];
                },
                
                set: function(key, value) {
                    this.data[key] = value;
                    StarGalaxy.api.events.emit('state:changed', { key, value });
                    return this;
                },
                
                remove: function(key) {
                    delete this.data[key];
                    StarGalaxy.api.events.emit('state:removed', { key });
                    return this;
                }
            },
            
            // Utility functions
            utils: {
                sanitizeInput: function(input) {
                    if (!input) return '';
                    
                    // Convert to string if it's not already
                    input = String(input);
                    
                    // Replace potentially dangerous characters
                    return input
                        .replace(/</g, '<')
                        .replace(/>/g, '>')
                        .replace(/"/g, '"')
                        .replace(/'/g, ''')
                        .replace(/`/g, '`')
                        .replace(/\(/g, '(')
                        .replace(/\)/g, ')')
                        .replace(/javascript:/gi, 'blocked:');
                },
                
                generateId: function() {
                    return 'sg-' + Math.random().toString(36).substr(2, 9);
                }
            }
        },
        
        // Logging system
        log: function(message, data) {
            if (!this.config.debug) return;
            
            if (data) {
                console.log(`[Star Galaxy] ${message}`, data);
            } else {
                console.log(`[Star Galaxy] ${message}`);
            }
        },
        
        error: function(message, error) {
            console.error(`[Star Galaxy ERROR] ${message}`, error);
            
            // Report error to UI if severe
            if (this.config.gracefulDegradation) {
                this.showErrorNotification(message);
            }
        },
        
        warn: function(message, data) {
            console.warn(`[Star Galaxy WARNING] ${message}`, data);
        },
        
        // Error notification in UI
        showErrorNotification: function(message) {
            // Only show one error notification at a time
            if (document.getElementById('sg-error-notification')) return;
            
            const notification = document.createElement('div');
            notification.id = 'sg-error-notification';
            notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(15, 23, 42, 0.9);
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                border-left: 4px solid #ff6b6b;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                z-index: 9999;
                max-width: 300px;
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            
            notification.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                    <strong>Something went wrong</strong>
                    <button id="sg-error-close" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px;">×</button>
                </div>
                <p style="margin: 0; font-size: 14px;">${message}</p>
                <div style="margin-top: 10px; font-size: 12px; opacity: 0.7;">The application will continue to function with limited features.</div>
            `;
            
            document.body.appendChild(notification);
            
            // Add close button functionality
            document.getElementById('sg-error-close').addEventListener('click', function() {
                notification.remove();
            });
            
            // Auto-remove after 10 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 10000);
        },
        
        // Script loading system
        loadScript: function(src, options = {}) {
            return new Promise((resolve, reject) => {
                // Skip if already loaded successfully
                if (this.status.loadedScripts[src]) {
                    this.log(`Script already loaded: ${src}`);
                    resolve(src);
                    return;
                }
                
                // Check dependencies first
                const dependencies = this.config.dependencies[src] || [];
                const unloadedDependencies = dependencies.filter(dep => !this.status.loadedScripts[`js/${dep}`]);
                
                if (unloadedDependencies.length > 0) {
                    this.log(`Loading dependencies for ${src}: ${unloadedDependencies.join(', ')}`);
                    
                    // Load dependencies first
                    Promise.all(unloadedDependencies.map(dep => this.loadScript(`js/${dep}`)))
                        .then(() => {
                            // Now load the script itself
                            this._loadSingleScript(src, options).then(resolve).catch(reject);
                        })
                        .catch(error => {
                            this.error(`Failed to load dependencies for ${src}:`, error);
                            reject(error);
                        });
                } else {
                    // No dependencies or all already loaded
                    this._loadSingleScript(src, options).then(resolve).catch(reject);
                }
            });
        },
        
        _loadSingleScript: function(src, options = {}) {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.async = options.async || false;
                
                // Set timeout to catch hanging scripts
                const timeoutId = setTimeout(() => {
                    this.error(`Script load timeout: ${src}`);
                    this.status.failedScripts[src] = { error: 'Timeout', retries: (this.status.failedScripts[src]?.retries || 0) + 1 };
                    reject(new Error(`Timeout loading script: ${src}`));
                }, options.timeout || this.config.scriptTimeout);
                
                script.onload = () => {
                    clearTimeout(timeoutId);
                    this.log(`Script loaded successfully: ${src}`);
                    this.status.loadedScripts[src] = true;
                    this.api.events.emit('script:loaded', { src });
                    resolve(src);
                };
                
                script.onerror = (error) => {
                    clearTimeout(timeoutId);
                    this.error(`Failed to load script: ${src}`, error);
                    
                    // Track failed scripts and retry count
                    this.status.failedScripts[src] = { 
                        error, 
                        retries: (this.status.failedScripts[src]?.retries || 0) + 1 
                    };
                    
                    // Retry loading if configured and under max retries
                    if (this.config.retryFailedScripts && this.status.failedScripts[src].retries < this.config.maxRetries) {
                        this.log(`Retrying script load (${this.status.failedScripts[src].retries}/${this.config.maxRetries}): ${src}`);
                        setTimeout(() => {
                            this._loadSingleScript(src, options).then(resolve).catch(reject);
                        }, 1000); // Wait 1 second before retry
                    } else {
                        reject(error);
                    }
                };
                
                document.body.appendChild(script);
            });
        },
        
        // Component registration system
        registerComponent: function(name, component) {
            this.log(`Registering component: ${name}`);
            
            // Store component status
            this.status.componentStatus[name] = {
                registered: true,
                initialized: false,
                healthy: true
            };
            
            // Initialize component if it has an init function
            if (typeof component.init === 'function') {
                try {
                    component.init(this.api);
                    this.status.componentStatus[name].initialized = true;
                    this.log(`Component initialized: ${name}`);
                } catch (e) {
                    this.error(`Failed to initialize component: ${name}`, e);
                    this.status.componentStatus[name].healthy = false;
                }
            }
            
            // Emit event for other components
            this.api.events.emit('component:registered', { name, component });
            
            return component;
        },
        
        // System initialization
        init: function() {
            this.log('Initializing Star Galaxy Core...');
            
            // Set up global error handler
            window.addEventListener('error', (e) => {
                this.error('Global error caught:', e);
                return false; // Let other error handlers run
            });
            
            // Set up unhandled promise rejection handler
            window.addEventListener('unhandledrejection', (e) => {
                this.error('Unhandled promise rejection:', e.reason);
            });
            
            // Load scripts in correct order
            this.loadScripts()
                .then(() => {
                    this.log('All scripts loaded successfully');
                    this.status.initialized = true;
                    this.api.events.emit('system:ready');
                })
                .catch(error => {
                    this.error('Failed to load all scripts:', error);
                    // Continue with graceful degradation
                    if (this.config.gracefulDegradation) {
                        this.status.initialized = true;
                        this.api.events.emit('system:ready-with-errors');
                    }
                });
            
            // Expose API globally for other scripts
            window.StarGalaxy = this.api;
            
            return this;
        },
        
        // Load all required scripts
        loadScripts: function() {
            const scripts = [
                'js/galaxy-bg.js',
                'js/create-favicon.js',
                'js/security.js',
                'js/auth.js',
                'js/idea-privacy.js',
                'js/idea-protection.js',
                'js/analyzeIdeaForLegalNorms.js',
                'js/analyzeIdeaForPatents.js',
                'js/checkPatentSimilarity.js',
                'js/setupUI.js',
                'js/analyzeWithAI.js',
                'js/app.js'
            ];
            
            // Load scripts sequentially to respect dependencies
            return scripts.reduce((promise, script) => {
                return promise.then(() => this.loadScript(script));
            }, Promise.resolve());
        }
    };
    
    // Initialize the system
    StarGalaxy.init();
})();
