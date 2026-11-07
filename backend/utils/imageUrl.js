function normalizeImageUrl(value) {
    if (typeof value !== 'string' || !value.trim()) {
        throw Object.assign(new Error('An image URL is required.'), { statusCode: 400 });
    }

    let url;
    try {
        url = new URL(value.trim());
    } catch {
        throw Object.assign(new Error('Enter a valid image URL.'), { statusCode: 400 });
    }

    if (!['http:', 'https:'].includes(url.protocol)) {
        throw Object.assign(new Error('Image URLs must use HTTP or HTTPS.'), { statusCode: 400 });
    }

    if (url.hostname === 'drive.google.com' || url.hostname === 'www.drive.google.com') {
        const pathMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
        const fileId = pathMatch?.[1] || url.searchParams.get('id');
        if (!fileId) {
            throw Object.assign(new Error('Use a Google Drive file sharing link, not a folder link.'), { statusCode: 400 });
        }
        return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1600`;
    }

    if (url.hostname === 'dropbox.com' || url.hostname === 'www.dropbox.com') {
        url.searchParams.delete('dl');
        url.searchParams.set('raw', '1');
        return url.href;
    }

    return url.href;
}

function normalizeImageUrls(value) {
    if (value == null) return [];
    if (!Array.isArray(value)) {
        throw Object.assign(new Error('Additional image URLs must be provided as a list.'), { statusCode: 400 });
    }
    return value.map(normalizeImageUrl);
}

module.exports = normalizeImageUrl;
module.exports.normalizeImageUrls = normalizeImageUrls;
