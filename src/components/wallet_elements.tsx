import * as React from 'react'

export const WalletAddress = ({address} : {address: string}) => {
        const linkref = React.createRef() ;
        const copyToClipboard = () => {
            const setFontSize = (linkref.current as any).style.fontSize;
            const regularFontSize = window.getComputedStyle((linkref.current as any), null).getPropertyValue('font-size');
            (linkref.current as any).style.fontSize = `${parseInt(regularFontSize, 10) + 2}px`;
            if ((window.navigator as any).clipboard) {
                (window.navigator as any).clipboard.writeText(address)
            }
            setTimeout(() => {(linkref.current as any).style.fontSize = setFontSize}, 250);
        };

        return (
        <div className={'infoSection'}>
            <p className={'infoLabel black'} >Your wallet address:</p>
            <div className={'lrsplit'} >
                <div
                    className={'gray addressLine truncate'}
                    style={{marginLeft: '0 !important'}}
                >{address}</div>
                <a 
                    ref={linkref as React.RefObject<HTMLAnchorElement>}
                    className={'bluelink addressLine'}
                    onClick={ copyToClipboard }
                    style={{display: 'inline'}}
                >Copy</a>
            </div>
        </div>
    )
}

export const OffchainBalance = ({balance} : {balance: number}) => {
    return (
        <div className={'infoSection'}>
            <p className={'infoLabel gray '}>Offchain balance:</p>
            <p className={'infoLabel black accent'} >{balance}</p>
        </div>
    )
}

export const OnchainBalance = ({balance} : {balance: number}) => {
    return (
        <div className={'infoSection'}>
            <p className={'infoLabel gray'} >Onchain balance:</p>
            <p className={'infoLabel black accent'}  >{balance}</p>
        </div>
    )
}

