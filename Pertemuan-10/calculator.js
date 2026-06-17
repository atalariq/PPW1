// =============================================
// calculator.js — Full button-based calculator
// Supports: +, -, ×, ÷, decimal, backspace, clear
// Expression history shown on display
// =============================================

// --- State ---
let currentValue = '0';      // Current number being typed
let previousValue = null;    // Stored operand before operator
let activeOperator = null;   // Pending operator (+, -, ×, ÷)
let shouldReset = false;     // Flag: next digit resets display
let expressionLine = '';     // Expression history shown above

// --- DOM refs ---
const displayEl = document.getElementById('display');
const exprEl = document.getElementById('expression');

// --- Update display ---
function updateDisplay() {
  displayEl.textContent = currentValue;
  exprEl.textContent = expressionLine;
}

// --- Digit input ---
function inputDigit(digit) {
  if (shouldReset) {
    currentValue = digit;
    shouldReset = false;
  } else {
    // Prevent multiple leading zeros (e.g. "00")
    if (currentValue === '0' && digit !== '.') {
      currentValue = digit;
    } else {
      // Cap digits to avoid UI overflow
      if (currentValue.replace('.', '').length >= 12) return;
      currentValue += digit;
    }
  }
  updateDisplay();
}

// --- Decimal point ---
function inputDecimal() {
  if (shouldReset) {
    currentValue = '0.';
    shouldReset = false;
    updateDisplay();
    return;
  }
  // Only one decimal allowed
  if (!currentValue.includes('.')) {
    currentValue += '.';
  }
  updateDisplay();
}

// --- Operator pressed ---
function handleOperator(op) {
  const num = parseFloat(currentValue);
  const symbolMap = { '+': ' + ', '-': ' − ', '*': ' × ', '/': ' ÷ ' };

  if (activeOperator && !shouldReset) {
    // Chain calculation: compute previous + current, then store as new previous
    const result = compute(previousValue, num, activeOperator);
    currentValue = String(result);
    expressionLine = `${formatNumber(result)}${symbolMap[op] || ` ${op} `}`;
    previousValue = result;
  } else {
    // First operator pressed
    previousValue = num;
    expressionLine = `${currentValue}${symbolMap[op] || ` ${op} `}`;
  }

  activeOperator = op;
  shouldReset = true;
  updateDisplay();
}

// --- Compute ---
function compute(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/':
      if (b === 0) return 'Error';
      return a / b;
    default: return b;
  }
}

// --- Equals ---
function handleEquals() {
  if (activeOperator === null) {
    // No operator pressed yet — just show current value
    expressionLine = `${currentValue} =`;
    updateDisplay();
    shouldReset = true;
    return;
  }

  const a = previousValue;
  const b = parseFloat(currentValue);
  const result = compute(a, b, activeOperator);
  const symbolMap = { '+': ' + ', '-': ' − ', '*': ' × ', '/': ' ÷ ' };

  expressionLine = `${formatNumber(a)}${symbolMap[activeOperator]}${formatNumber(b)} =`;
  currentValue = result === 'Error' ? 'Error' : formatNumber(result);
  activeOperator = null;
  previousValue = null;
  shouldReset = true;
  updateDisplay();
}

// --- Clear ---
function handleClear() {
  currentValue = '0';
  previousValue = null;
  activeOperator = null;
  shouldReset = false;
  expressionLine = '';
  updateDisplay();
}

// --- Backspace ---
function handleBackspace() {
  if (shouldReset) return;
  if (currentValue.length === 1) {
    currentValue = '0';
  } else {
    currentValue = currentValue.slice(0, -1);
  }
  updateDisplay();
}

// --- Percentage ---
function handlePercent() {
  const num = parseFloat(currentValue);
  currentValue = formatNumber(num / 100);
  updateDisplay();
}

// --- Negate (+/-) ---
function handleNegate() {
  if (currentValue === '0') return;
  currentValue = currentValue.startsWith('-')
    ? currentValue.slice(1)
    : '-' + currentValue;
  updateDisplay();
}

// --- Helper: format display number ---
function formatNumber(n) {
  if (n === 'Error') return 'Error';
  if (typeof n === 'number' && !Number.isFinite(n)) return 'Error';
  // Round to avoid floating-point noise, max 10 significant digits
  const s = parseFloat(n.toPrecision(10)).toString();
  // Cap display length
  return s.length > 15 ? n.toExponential(6) : s;
}

// --- Keyboard support ---
document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') {
    inputDigit(e.key);
  } else if (e.key === '.') {
    inputDecimal();
  } else if (e.key === '+') {
    handleOperator('+');
  } else if (e.key === '-') {
    handleOperator('-');
  } else if (e.key === '*') {
    handleOperator('*');
  } else if (e.key === '/') {
    e.preventDefault();
    handleOperator('/');
  } else if (e.key === 'Enter' || e.key === '=') {
    e.preventDefault();
    handleEquals();
  } else if (e.key === 'Backspace') {
    handleBackspace();
  } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
    handleClear();
  } else if (e.key === '%') {
    handlePercent();
  }
});
