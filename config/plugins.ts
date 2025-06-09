export default () => ({env}) => ({
    'users-permissions': {
        config: {
            jwtSecret: env('JWT_SECRET'),
        }
    },
    'content-export-import': {
        enabled:true,
        config: {}
    }
});
