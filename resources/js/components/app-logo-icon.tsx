import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(
    props: ImgHTMLAttributes<HTMLImageElement>,
) {
    return <img src="/logo.jpeg" alt="AlphaForce ProjectLink" {...props} />;
}
