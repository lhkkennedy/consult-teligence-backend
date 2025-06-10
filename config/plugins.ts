export default () => ({env}) => ({
    'users-permissions': {
        config: {
            jwtSecret: env('JWT_SECRET'),
        }
    },
    // 'upload': {
    //     config: {
    //     // v5 renamed “responsiveDimensions” into imageOptimization.responsiveDimensions
    //         imageOptimization: {
    //             // Turn off all responsive-variant generation
    //             responsiveDimensions: false,
    //             // Turn off any size‐optimization (quality/compression)
    //             optimize:        false,
    //             // You can still enforce a max upload size if you like:
    //             sizeLimit:       env.int('STRAPI_UPLOAD_SIZE_LIMIT', 100_000_000),
    //         },
    //         provider: 'local',
    //         providerOptions: {
    //             // max file size in bytes (here 250 MB)
    //             sizeLimit: 250 * 1024 * 1024,
    //             // options passed to koa-static for serving the files
    //             localServer: {
    //             maxage: 300000, // cache-control max-age in ms
    //             },
    //         },
    //     },
    // },
});
