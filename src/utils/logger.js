// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    
    // Foreground colors
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

function getTimestamp() {
    return new Date().toISOString().replace('T', ' ').substr(0, 19);
}

function formatMessage(level, message, color) {
    const timestamp = getTimestamp();
    return `${colors.dim}[${timestamp}]${colors.reset} ${color}${level}${colors.reset} ${message}`;
}

export default {
    info(message) {
        console.log(formatMessage('INFO ', message, colors.cyan));
    },
    
    success(message) {
        console.log(formatMessage('SUCCESS', message, colors.green));
    },
    
    warn(message) {
        console.warn(formatMessage('WARN ', message, colors.yellow));
    },
    
    error(message, error = null) {
        console.error(formatMessage('ERROR', message, colors.red));
        if (error) {
            console.error(colors.dim + error.stack + colors.reset);
        }
    },
    
    debug(message) {
        if (process.env.DEBUG === 'true') {
            console.log(formatMessage('DEBUG', message, colors.magenta));
        }
    },
    
    command(commandName, user) {
        console.log(formatMessage('CMD  ', `/${commandName} executed by ${user}`, colors.blue));
    }
};
