const https = require('https');

async function exchangeCodeForToken(code, callbackUrl) {
    const data = JSON.stringify({
        client_id: process.env.OAUTH_CLIENT_ID,
        client_secret: process.env.OAUTH_CLIENT_SECRET,
        code: code,
        redirect_uri: callbackUrl
    });

    const options = {
        hostname: 'github.com',
        path: '/login/oauth/access_token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Content-Length': data.length,
            'User-Agent': 'Decap-CMS-OAuth'
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    reject(new Error(`Failed to parse response: ${body}`));
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function main(args) {
    const { code, state } = args;

    if (!code) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'text/html' },
            body: '<html><body><h1>Error: No authorization code received</h1></body></html>'
        };
    }

    try {
        // Get the namespace URL for callback
        const namespace = process.env.__OW_NAMESPACE;
        const apiHost = process.env.__OW_API_HOST;
        const callbackUrl = `https://astro-static-site-s3a28.ondigitalocean.app/api/v1/oauth/callback`;

        // Exchange code for token
        const response = await exchangeCodeForToken(code, callbackUrl);

        if (response.error) {
            throw new Error(response.error_description || response.error);
        }

        // Create the success response HTML
        const successHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Authentication Success</title>
                <script>
                    const authResponse = {
                        token: '${response.access_token}',
                        provider: 'github'
                    };
                    
                    // Post message to opener window (the CMS)
                    if (window.opener) {
                        window.opener.postMessage(
                            'authorization:github:success:' + JSON.stringify(authResponse),
                            window.opener.location.origin
                        );
                    }
                    
                    // Also try postMessage without opener (for some browsers)
                    window.postMessage(
                        'authorization:github:success:' + JSON.stringify(authResponse),
                        '*'
                    );
                    
                    // Close the window after a short delay
                    /*setTimeout(() => {
                        window.close();
                    }, 1000);*/
                </script>
            </head>
            <body>
                <div style="text-align: center; padding: 50px; font-family: sans-serif;">
                    <h1>✅ Authentication Successful</h1>
                    <p>You can close this window now.</p>
                    <p style="color: #666;">If this window doesn't close automatically, please close it manually.</p>
                </div>
            </body>
            </html>
        `;

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'text/html',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            },
            body: successHtml
        };

    } catch (error) {
        console.error('OAuth callback error:', error);

        return {
            statusCode: 500,
            headers: { 'Content-Type': 'text/html' },
            body: `
                <html>
                <body style="text-align: center; padding: 50px; font-family: sans-serif;">
                    <h1>❌ Authentication Failed</h1>
                    <p>Error: ${error.message}</p>
                    <p><a href="https://astro-static-site-s3a28.ondigitalocean.app/admin/">Try again</a></p>
                </body>
                </html>
            `
        };
    }
}

exports.main = main;