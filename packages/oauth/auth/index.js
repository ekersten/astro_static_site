function main(args) {
    const clientId = process.env.OAUTH_CLIENT_ID;


    // Construct callback URL
    const callbackUrl = `https://astro-static-site-s3a28.ondigitalocean.app/api/v1/oauth/callback`;

    // GitHub OAuth authorization URL
    const authUrl = new URL('https://github.com/login/oauth/authorize');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', callbackUrl);
    authUrl.searchParams.append('scope', 'repo,user');

    return {
        statusCode: 302,
        headers: {
            'Location': authUrl.toString(),
            'Cache-Control': 'no-cache'
        }
    };
}

exports.main = main;