const courseServiceUrl = process.env.REACT_APP_API_URL;

const isDevelopment = process.env.NODE_ENV !== 'production';

const canBypassLogin = false;

export default { courseServiceUrl, canBypassLogin, isDevelopment };