function setupUI() {
    console.log('Setting up UI...');
    
    // Menu navigation
    document.querySelectorAll('.sidebar-menu li').forEach(item => {
        const link = item.querySelector('a');
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo(item.getAttribute('data-page'));
            });
        }
    });
    
    // AI options selection
    document.querySelectorAll('.ai-option').forEach( option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options
            document.querySelectorAll('.ai-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Add selected class to clicked option
            option.classList.add('selected');
        });
    });
    
    // Analyze button
    const analyzeButton = document.getElementById('analyze-button');
    if (analyzeButton) {
        analyzeButton.addEventListener('click', analyze);
    }
}
