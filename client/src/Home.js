import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from "react-router-dom"
import Web3 from "web3";
import SupplyChainABI from "./artifacts/SupplyChain.json"
import Modal from 'react-bootstrap/Modal';
import Select, { components } from 'react-select';
import Button from 'react-bootstrap/Button';
import { useTranslation } from "react-i18next";
import { IT, GB } from 'country-flag-icons/react/3x2'

console.log('🏠 Home component module loaded');

function Home() {
    console.log('🏗️ Home component initializing...');
    
    const [t, i18n] = useTranslation("translation");
    console.log('🌐 Translation hook initialized');
    
    const handleChangeLanguage = (lang) => {
        console.log('🔄 Changing language to:', lang);
        i18n.changeLanguage(lang);
    } 

    const history = useNavigate()
    console.log('🧭 Navigation hook initialized');
    
    useEffect(() => {
        console.log('⚡ Home useEffect triggered - starting blockchain initialization');
        loadWeb3();
        loadBlockchaindata();
    }, [])

    const [loader, setloader] = useState(true);
    const [selectedID, setSelectedID] = useState();
    const [retID, setRetID] = useState();
    const [retLotStock, setRetLotStock] = useState();
    const [id, setId] = useState([{}]);
    const [show, setShow] = useState(false);

    console.log('📊 Home component state initialized');

    const loadWeb3 = async () => {
        console.log('🌐 Starting Web3 initialization...');
        try {
            if (window.ethereum) {
                console.log('✅ MetaMask detected, connecting...');
                window.web3 = new Web3(window.ethereum);
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                console.log('✅ Web3 connected successfully via MetaMask');
            } else if (window.web3) {
                console.log('✅ Legacy Web3 detected, connecting...');
                window.web3 = new Web3(window.web3.currentProvider);
                console.log('✅ Web3 connected successfully via legacy provider');
            } else {
                console.error('❌ No Web3 provider found');
                window.alert(
                    t("ethAlert")
                );
            }
        } catch (error) {
            console.error('❌ Web3 initialization failed:', error);
        }
    };    const loadBlockchaindata = async () => {
        console.log('🔗 Starting blockchain data loading...');
        setloader(true);
        
        try {
            const web3 = window.web3;
            if (!web3) {
                console.error('❌ Web3 not initialized');
                return;
            }
            
            console.log('🌐 Getting network ID...');
            const networkId = await web3.eth.net.getId();
            console.log('✅ Network ID:', networkId);
            
            console.log('🔍 Looking for contract on network:', networkId);
            const networkData = SupplyChainABI.networks[networkId];
            
            if (networkData) {
                console.log('✅ Contract found at address:', networkData.address);
                
                const supplychain = new web3.eth.Contract(SupplyChainABI.abi, networkData.address);
                console.log('📄 Contract instance created');
                
                console.log('📊 Getting product counter...');
                const productCtr = await supplychain.methods.productCtr().call();
                console.log('✅ Product counter:', productCtr);
                
                const prod = {};
                console.log('🔄 Loading products...');
                for (let i = 0; i < productCtr; i++) {
                    console.log(`📦 Loading product ${i + 1}...`);
                    prod[i] = await supplychain.methods.ProductStock(i + 1).call();
                    console.log(`✅ Product ${i + 1} loaded:`, prod[i]);
                }
                
                console.log('📊 Getting lot counter...');
                const lotCtr = await supplychain.methods.absoluteCtr().call();
                console.log('✅ Lot counter:', lotCtr);
                
                const ids = [];
                const lot = {};
                console.log('🔄 Loading lots...');
                for (let i = 0; i < lotCtr; i++) {
                    console.log(`📦 Loading lot ${i + 1}...`);
                    lot[i] = await supplychain.methods.LotStock(i + 1).call();
                    console.log(`✅ Lot ${i + 1} loaded:`, lot[i]);
                    
                    if (parseInt(lot[i].stage) === 4) {
                        console.log(`✅ Lot ${i + 1} is at stage 4, adding to dropdown`);
                        ids.push({value: lot[i].id, label: prod[parseInt(lot[i].id_product)-1].name})
                    }
                }
                console.log('✅ Stage 4 lots for dropdown:', ids);
                
                console.log('📊 Getting retail lot counter...');
                const retLotCtr = await supplychain.methods.retLotCtr().call();
                console.log('✅ Retail lot counter:', retLotCtr);
                
                const retLot = {};
                console.log('🔄 Loading retail lots...');
                for (let i = 0; i < retLotCtr; i++) {
                    console.log(`🛒 Loading retail lot ${i + 1}...`);
                    retLot[i] = await supplychain.methods.RetLotStock(i + 1).call();
                    console.log(`✅ Retail lot ${i + 1} loaded:`, retLot[i]);
                }
                
                console.log('💾 Setting state with loaded data...');
                setId(ids);
                setRetLotStock(retLot);
                setloader(false);
                console.log('✅ Blockchain data loading completed successfully');
            }
            else {
                console.error('❌ Contract not found on network:', networkId);
                console.error('Available networks in ABI:', Object.keys(SupplyChainABI.networks));
                alert(t("contractAlert"));            }
        } catch (error) {
            console.error('❌ Blockchain data loading failed:', error);
            setloader(false);
        }
    }
    
    console.log('🔄 Home component render - loader state:', loader);
    
    if (loader) {
        console.log('⌛ Rendering loading screen...');
        return (
            <div>
                <h1 className="wait">{t("loading")}</h1> 
            </div>
        )
    }
    
    console.log('✨ Rendering main Home content...');
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
        history("/show", {state: retID});
    }
    const handleShow = () => {
        setShow(true);
    }
    const handleClose = () => setShow(false);
    const handleSelection = (event) => {
        setSelectedID(parseInt(event.value));
        for(let i=0; i<Object.keys(retLotStock).length; i++){
            if (retLotStock[i].absolute_id === event.value) {
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
            {/* <div className="h4 pb-5 mb-5 border-bottom border-dark"></div>
            <h4>
                {t("showLabel")}
                <button onClick={handleShow} className="ms-4 btn btn-outline-primary">{t("showButton")}</button>
            </h4> */}

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
