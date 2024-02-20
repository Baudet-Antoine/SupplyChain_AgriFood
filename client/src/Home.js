import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from "react-router-dom"
import Web3 from "web3";
import SupplyChainABI from "./artifacts/SupplyChain.json"
import Modal from 'react-bootstrap/Modal';
import Select, { components } from 'react-select';
import Button from 'react-bootstrap/Button';
import { useTranslation } from "react-i18next";
import { IT, GB } from 'country-flag-icons/react/3x2'

function Home() {
    
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
    const [selectedID, setSelectedID] = useState();
    const [retID, setRetID] = useState();
    const [retLotStock, setRetLotStock] = useState();
    const [id, setId] = useState([{}]);
    const [show, setShow] = useState(false);

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
            const productCtr = await supplychain.methods.productCtr().call();
            const prod = {};
            for (let i = 0; i < productCtr; i++) {
                prod[i] = await supplychain.methods.ProductStock(i + 1).call();
            }
            const lotCtr = await supplychain.methods.absoluteCtr().call();
            const ids = [];
            const lot = {};
            for (let i = 0; i < lotCtr; i++) {
                lot[i] = await supplychain.methods.LotStock(i + 1).call();
                if (parseInt(lot[i].stage) == 4) {
                    ids.push({value: lot[i].id, label: prod[parseInt(lot[i].id_product)-1].name})
                }
            }
            const retLotCtr = await supplychain.methods.retLotCtr().call();
            const retLot = {};
            for (let i = 0; i < retLotCtr; i++) {
                retLot[i] = await supplychain.methods.RetLotStock(i + 1).call();
            }
            setId(ids);
            setRetLotStock(retLot);
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
    const redirect_to_roles = () => {
        history('/roles')
    }
    const redirect_to_addprod = () => {
        history('/addprod')
    }
    const redirect_to_performaction = () => {
        history('/performaction')
    }
    const redirect_to_show = () => {
        console.log(retID)
        history("/show", {state: retID});
    }
    const handleShow = () => {
        setShow(true);
    }
    const handleClose = () => setShow(false);
    const handleSelection = (event) => {
        setSelectedID(parseInt(event.value));
        for(let i=0; i<Object.keys(retLotStock).length; i++){
            if (retLotStock[i].absolute_id == event.value) {
                setRetID(parseInt(retLotStock[i].id));
                break;
            }
        }
    }
    const NoOptionsMessage = props => {
        return (
            <components.NoOptionsMessage {...props}>
            <span>{t("noOptionsMessage")}</span>
            </components.NoOptionsMessage>
        );
    };
    return (
        <div className='main'>
            <div className='container'>
                <h1 className='title'>{t("title")}</h1>
                <GB title="English" type='button' onClick={() => handleChangeLanguage("en")}  style={{position: 'absolute', right: '55px', top: '25px', height: '30px'}}/>
                <IT title="Italiano" type='button' onClick={() => handleChangeLanguage("it")}  style={{position: 'absolute', right: '120px', top: '25px', height: '30px'}}/>
            </div>
            <br />
            <h4>
                {t("registerLabel")}
                <button onClick={redirect_to_roles} className="ms-4 btn btn-outline-primary">{t("registerButton")}</button>
            </h4>            
            <br />
            <h4>
                {t("addLabel")}
                <button onClick={redirect_to_addprod} className="ms-4 btn btn-outline-primary">{t("addButton")}</button>
            </h4>
            <br />
            <h4>
                {t("managerLabel")}
                <button onClick={redirect_to_performaction} className="ms-4 btn btn-outline-primary">{t("manageButton")}</button>
            </h4>
            <div className="h4 pb-5 mb-5 border-bottom border-dark"></div>
            <h4>
                {t("showLabel")}
                <button onClick={handleShow} className="ms-4 btn btn-outline-primary">{t("showButton")}</button>
            </h4>

            <Modal show={show} onHide={handleClose}>
                {console.log('ciao')}
                <Modal.Header closeButton>
                    <Modal.Title>{t("showTitle")}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Select 
                        components={{ NoOptionsMessage }}
                        name="colors"
                        options={id}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        autoFocus={true} 
                        onChange={handleSelection}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        {t("close")}
                    </Button>
                    <Button variant="warning" onClick={redirect_to_show}>
                        {t("history")}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default Home
