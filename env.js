global.appdir = __dirname;

global.SETUP = false;
global.CONFIG = {
    name: "",
    key: "",
    secret: "",
    pairs: []
};


global.CONFIGS = [];
global.SELECTED_CONFIG = -1;
global.TRADERS = [];

if (process.env.C9_USER) {
    process.env.DB_HOST = process.env.IP;
    process.env.DB_PORT = 27017;
}