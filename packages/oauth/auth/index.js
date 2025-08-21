function main(args) {
    const clientId = process.env.OAUTH_CLIENT_ID;
    const baseUrl = process.env.BASE_URL || 'https://astro-static-site-s3a28.ondigitalocean.app';

    // Construct callback URL
    const callbackUrl = `${baseUrl}/api/v1/oauth/callback`;

    // Generate random state for CSRF protection
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // GitHub OAuth authorization URL
    const authUrl = new URL('https://github.com/login/oauth/authorize');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', callbackUrl);
    authUrl.searchParams.append('scope', 'repo,user');
    authUrl.searchParams.append('state', state);

    return {
        statusCode: 302,
        headers: {
            'Location': authUrl.toString(),
            'Cache-Control': 'no-cache'
        }
    };
}

exports.main = main;