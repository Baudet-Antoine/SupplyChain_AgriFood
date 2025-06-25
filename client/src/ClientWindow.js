import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from "react-router-dom"
import Web3 from "web3";
import SupplyChainABI from "./artifacts/SupplyChain.json"
import Modal from 'react-bootstrap/Modal';
import Select, { components } from 'react-select';
import Button from 'react-bootstrap/Button';
import { useTranslation } from "react-i18next";
import { IT, GB } from 'country-flag-icons/react/3x2'

function ClientWindow() {
    
    const [t, i18n] = useTranslation("translation");
    const handleChangeLanguage = (lang) => {
        i18n.changeLanguage(lang);
    } 

    const history = useNavigate()
    useEffect(() => {
        loadWeb3();
        loadBlockchaindata();
    }, [])

    const [loader, setloader] = useState(true);
    const [retID, setRetID] = useState();
    const [absoluteLot, setAbsoluteLot] = useState();


    const loadWeb3 = async () => {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.request({ method: 'eth_requestAccounts' });
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        } else {
            window.alert(
                t("ethAlert")
            );
        }
    };
    const loadBlockchaindata = async () => {
        setloader(true);
        const web3 = window.web3;
        const networkId = await web3.eth.net.getId();
        const networkData = SupplyChainABI.networks[networkId];
        if (networkData) {
            const supplychain = new web3.eth.Contract(SupplyChainABI.abi, networkData.address);
            
            const lotCtr = await supplychain.methods.absoluteCtr().call();
            const ids = [];
            const lot = {};
            for (let i = 0; i < lotCtr; i++) {
                lot[i] = await supplychain.methods.LotStock(i + 1).call();
            }
            setAbsoluteLot(lot);
            setloader(false);
        }
        else {
            t("contractAlert")
        }
    }
    if (loader) {
        return (
            <div>
                <h1 className="wait">{t("loading")}</h1> 
            </div>
        )
    }

    const redirect_to_show = () => {
        let cond=false;
        for (let i = 0; i < Object.keys(absoluteLot).length; i++) {
            if(parseInt(absoluteLot[i].id) === retID && parseInt(absoluteLot[i].stage)===4) {
                cond=true;
                break;
            }
        }
        // FIX: pass the actual absolute_id, not retID-1
        if (cond) history("/show", {state: retID});
        else{
            window.alert(
                t("attention")
            );
        }
    }

    const handlerSelect = (event) => {
        setRetID(parseInt(event.target.value));
    }
    
    return (
        <div className='main'>
            <div className='container'>
                <h1 className='title'>{t("past")}</h1>
                <GB title="English" type='button' onClick={() => handleChangeLanguage("en")}  style={{position: 'absolute', right: '55px', top: '25px', height: '30px'}}/>
                <IT title="Italiano" type='button' onClick={() => handleChangeLanguage("it")}  style={{position: 'absolute', right: '120px', top: '25px', height: '30px'}}/>
            </div>
            <br /><br/>

            <form onSubmit={redirect_to_show}>
                <div className="form-floating mb-3">
                    <input type="number" className="form-control" id="floatingEth" placeholder="insert" onChange={handlerSelect} required/>
                    <label for="floatingEth">{t("label")}</label>
                </div>
                <div className='mb-3' style={{textAlign: 'center'}}>
                    <button className="btn btn-warning" onSubmit={redirect_to_show} style={{width: '10cm', fontWeight: 'bold'}}>{t("showButton")}</button>
                </div> 
            </form>
        </div>
    )
}

export default ClientWindow
