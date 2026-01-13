/**
 * ASHOK SERVICES - MASTER SCRIPT
 * Features: Dual-Sheet Logic, Advanced CSV Parsing, Default Dark Mode
 */

const repairSheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRPXAlCtH-DXvjGmoIpc5j8TQzJpJhfuT36sIU5Y9l0-qk_z2VYyClFzLk2N1LxmomZAyGecxjGKIyy/pub?output=csv";
const partsSheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS7FjutTXkrEMA10CYXrco34xiTahV9GkCK9StE3hqLly_dKVlhJddHQayDA-HBgxpVlIDnIUpTN6jX/pub?output=csv";

let siteData = [];

// Helper to apply theme changes to UI
function applyThemeUI(theme) {
    const themeBtn = document.getElementById('theme-toggle');
    if (theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (themeBtn) {
            themeBtn.innerText = theme === 'dark' ? '☀️' : '🌙';
        }
    }
}

function getCorrectURL() {
    const path = window.location.pathname;
    const timestamp = "&t=" + new Date().getTime();
    if (path.includes("parts.html")) {
        return partsSheetURL + timestamp;
    } else {
        return repairSheetURL + timestamp;
    }
}

function parseCSV(text) {
    const rows = [];
    const regex = /(?!\s*$)\s*(?:'([^']*)'|"([^"]*)"|([^,]*))\s*(?:,|$)/g;
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
        if (index === 0 || line.trim() === "") return;
        const row = [];
        line.replace(regex, (m, c1, c2, c3) => {
            row.push(c1 || c2 || c3 || "");
        });
        if (row.length >= 4) {
            rows.push({
                brand: row[0].replace(/"/g, '').trim(),
                model: row[1].replace(/"/g, '').trim(),
                option: row[2].replace(/"/g, '').trim(),
                price: row[3].replace(/"/g, '').trim()
            });
        }
    });
    return rows;
}

async function loadData() {
    try {
        const activeURL = getCorrectURL();
        const response = await fetch(activeURL);
        const csvText = await response.text();
        siteData = parseCSV(csvText);
        populateBrands();
    } catch (e) { 
        console.error("Critical Error: Spreadsheet failed to load.", e); 
    }
}

function populateBrands() {
    const brandMenu = document.getElementById("brandMenu");
    if (!brandMenu) return;
    const uniqueBrands = [...new Set(siteData.map(i => i.brand))].filter(b => b);
    brandMenu.innerHTML = '<option value="">Select Device Brand</option>';
    uniqueBrands.forEach(brand => {
        let opt = document.createElement("option");
        opt.value = brand;
        opt.text = brand;
        brandMenu.appendChild(opt);
    });
}

function updateModels() {
    const selectedBrand = document.getElementById("brandMenu").value;
    const modelMenu = document.getElementById("modelMenu");
    modelMenu.innerHTML = '<option value="">Select Model Name</option>';
    modelMenu.disabled = !selectedBrand;
    const filteredModels = [...new Set(siteData
        .filter(item => item.brand === selectedBrand)
        .map(item => item.model))];
    filteredModels.forEach(model => {
        let opt = document.createElement("option");
        opt.value = model;
        opt.text = model;
        modelMenu.appendChild(opt);
    });
    document.getElementById("optionMenu").disabled = true;
    document.getElementById("resultBox").style.display = "none";
}

function updateOptions() {
    let brand = document.getElementById("brandMenu").value;
    const model = document.getElementById("modelMenu").value;
    const optionMenu = document.getElementById("optionMenu");
    if (!brand && model) {
        const foundItem = siteData.find(i => i.model === model);
        if (foundItem) {
            brand = foundItem.brand;
            document.getElementById("brandMenu").value = brand;
        }
    }
    optionMenu.innerHTML = '<option value="">Select Service / Part</option>';
    optionMenu.disabled = !model;
    const availableOptions = siteData.filter(i => i.brand === brand && i.model === model);
    availableOptions.forEach(item => {
        let opt = document.createElement("option");
        opt.value = item.price;
        opt.text = item.option;
        optionMenu.appendChild(opt);
    });
}

function showFinalPrice() {
    const price = document.getElementById("optionMenu").value;
    const resultBox = document.getElementById("resultBox");
    if(price) {
        document.getElementById("finalPrice").innerText = price;
        resultBox.style.display = "none"; 
        setTimeout(() => {
            resultBox.style.display = "block";
            resultBox.style.animation = 'none';
            resultBox.offsetHeight; 
            resultBox.style.animation = null; 
        }, 10);
    }
}

function sendWhatsApp() {
    const brand = document.getElementById("brandMenu").value;
    const model = document.getElementById("modelMenu").value;
    const optionMenu = document.getElementById("optionMenu");
    const optionText = optionMenu.options[optionMenu.selectedIndex].text;
    const price = document.getElementById("finalPrice").innerText;
    const myNumber = "917819049772"; 
    const message = `Hi Ashok Services, I am interested in:\n- Brand: ${brand}\n- Model: ${model}\n- Service: ${optionText}\n- Price: ${price}\n\nIs this available?`;
    const whatsappURL = `https://wa.me/${myNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
}

function filterModels() {
    const input = document.getElementById('modelSearch').value.toLowerCase();
    const brandMenu = document.getElementById('brandMenu');
    const modelMenu = document.getElementById('modelMenu');
    if (input.length > 0 && brandMenu.value === "") {
        modelMenu.disabled = false;
        modelMenu.innerHTML = '<option value="">Searching all models...</option>';
        const allModels = [...new Set(siteData.map(i => i.model))];
        allModels.forEach(m => {
            let opt = document.createElement("option");
            opt.value = m; opt.text = m;
            modelMenu.appendChild(opt);
        });
    }
    const options = modelMenu.getElementsByTagName('option');
    for (let i = 1; i < options.length; i++) {
        const txtValue = options[i].textContent || options[i].innerText;
        if (txtValue.toLowerCase().indexOf(input) > -1) {
            options[i].style.display = "";
        } else {
            options[i].style.display = "none";
        }
    }
}

/**
 * UPDATED THEME LOGIC - FORCING DARK MODE
 */
function applyThemeUI(theme) {
    const themeBtn = document.getElementById('theme-toggle');
    if (theme) {
        document.documentElement.setAttribute('data-theme', theme);
        // Ensure the icon matches the theme
        if (themeBtn) {
            themeBtn.innerText = theme === 'dark' ? '☀️' : '🌙';
        }
    }
}

function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyThemeUI(newTheme);
    localStorage.setItem('theme', newTheme);
}

// Logic to run as soon as the page loads
window.onload = () => {
    // 1. Check if we have forced the new "Default Dark" update yet
    if (!localStorage.getItem('forceDarkUpdateV1')) {
        localStorage.setItem('theme', 'dark'); // Overwrite old light preference
        localStorage.setItem('forceDarkUpdateV1', 'true'); // Don't overwrite again
    }

    // 2. Get the theme (now defaults to dark)
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyThemeUI(savedTheme);
    
    loadData();
};
// Popup logic for parts.html
window.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes("parts.html")) {
        if (!sessionStorage.getItem('popupShown')) {
            const popup = document.getElementById('partsPopup');
            if (popup) popup.style.display = 'flex';
        }
    }
});

function closePopup() {
    const popup = document.getElementById('partsPopup');
    if (popup) popup.style.display = 'none';
    sessionStorage.setItem('popupShown', 'true');
}

function handleLeadSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('custName').value;
    const shop = document.getElementById('shopName').value || "Individual";
    const address = document.getElementById('custAddress').value;
    const phone = document.getElementById('custPhone').value;
    console.log("Lead captured:", name);
    closePopup();
}

