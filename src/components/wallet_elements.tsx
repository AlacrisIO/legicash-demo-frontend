import * as React from 'react'
import {Loader}   from 'semantic-ui-react';
import {Money}    from '../types/units';

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

export const SidechainBalance = ({balance, pending = false} : {balance: Money, pending: boolean}) => {
    const loader = pending ? <Loader active={true} inline={true} size={'tiny'} /> : '';
    const balanceClasses =   pending ? 'infoLabel gray accent' : 'infoLabel black accent';
    return (
        <div className={'infoSection'}>
            <p className={'infoLabel gray'}>Side chain balance:</p>
            <div className={balanceClasses} >{ balance.toEth(10) }  {loader}</div>
        </div>
    )
}

export const MainchainBalance = ({balance} : {balance: Money}) => {
    return (
        <div className={'infoSection'}>
            <p className={'infoLabel gray'} >Main chain balance:</p>
            <p className={'infoLabel black accent'}  >{balance.toEth(10)}</p>
        </div>
    )
}

