import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Web3 from "web3";
import SupplyChainABI from "./artifacts/SupplyChain.json";
import { useTranslation } from "react-i18next";
import { IT, GB } from 'country-flag-icons/react/3x2'

function AddProd() {

    const [t, i18n] = useTranslation("translation");
    const handleChangeLanguage = (lang) => {
        i18n.changeLanguage(lang);
    } 

    const history = useNavigate()
    useEffect(() => {
        loadWeb3();
        loadBlockchaindata();
    }, [])

    const [currentaccount, setCurrentaccount] = useState("");
    const [loader, setloader] = useState(true);
    const [supplyChain, setSupplyChain] = useState();
    const [product, setProduct] = useState();
    const [productName, setProductName] = useState();
    const [productIngr, setProductIngr] = useState([]);
    const [actors, setActors] = useState();
    const [file, setFile] = useState("");
    const [hashProd, setHashProd] = useState();
    const [ingrid, setIngrid] = useState([])

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
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        setCurrentaccount(account);
        const networkId = await web3.eth.net.getId();
        const networkData = SupplyChainABI.networks[networkId];
        if (networkData) {
            const supplychain = new web3.eth.Contract(SupplyChainABI.abi, networkData.address);
            setSupplyChain(supplychain);
            const actCtr = await supplychain.methods.actorCtr().call();
            const act = {};
            for (let i = 0; i < actCtr; i++) {
                act[i] = await supplychain.methods.Actors(i+1).call();
            }
            const prodCtr = await supplychain.methods.productCtr().call();
            const prod = {};
            const hashProd = {}
            const ingrid = [];
            for (let i = 0; i < prodCtr; i++) {
                prod[i] = await supplychain.methods.ProductStock(i+1).call();
                ingrid[i] = await supplychain.methods.getProductIngredient(i+1).call();
                hashProd[i] = await supplychain.methods.getProductHahs(i + 1).call();
            }
            setProduct(prod);
            setActors(act);
            setProductIngr(ingrid);
            setHashProd(hashProd);
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
    const redirect_to_home = () => {
        history('/')
    }
    const handlerChangeNameProduct = (event) => {
        setProductName(event.target.value);
    }
    const handlerChangeIngrProduct = (event) => {
        const ingr = [];
        for (let index = 0; index < event.length; index++) {
            ingr.push(event[index].value);
        }
        setIngrid(ingr)
    }
    const getHash = async (file) => {
        const fileData = new FormData();
        fileData.append("file", file);
        const response = await axios({
            method: "post",
            url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
            data: fileData,
            headers: {
                'pinata_api_key': process.env.REACT_APP_PINATA_API_KEY,
                'pinata_secret_api_key': process.env.REACT_APP_PINATA_SECRET_KEY,
                "Content-Type": "multipart/form-data"
            }
        })
        return response.data.IpfsHash;
    }
    const handlerSubmitProduct = async (event) => {
        event.preventDefault();
        const responseData = []
        try {
            for(let i=0; i<file.length; i++){
                const val = await Promise.all([getHash(file[i])]).then((values) => {
                    return values;
                });
                responseData.push(val[0]);
            }
            var reciept = await supplyChain.methods.addProduct(productName, ingrid, responseData).send({ from: currentaccount });
            setIngrid([])
            if (reciept) {
                loadBlockchaindata();
            }
        }
        catch (err) {
            alert(t("errAlert"))
        }
    }
    const handleDeleteProduct = async (event) => {
        event.preventDefault();
        try {
            var reciept = await supplyChain.methods.deleteProd(parseInt(event.target.value)+1).send({ from: currentaccount });
            if (reciept) {
                loadBlockchaindata();
            }
        }
        catch (err) {
            alert(t("errAlert"))
        }
    }
    const name_ingr = [];
    for (let i = 0; i < Object.keys(product).length; i++) {
        if(product[i].name !== '' && product[i].active) name_ingr.push({value: product[i].id, label: product[i].name})
    }

    return (
        <div className='main'>
            <dev className='container'>
                <button onClick={redirect_to_home} className="ms-4 btn btn-danger" style={{ position: 'absolute', left: '35px', top: '40px' }}>HOME</button>
                <h1 className='title'>Add Product</h1>
                <GB title="English" type='button' onClick={() => handleChangeLanguage("en")}  style={{position: 'absolute', right: '55px', top: '45px', height: '30px'}}/>
                <IT title="Italiano" type='button' onClick={() => handleChangeLanguage("it")}  style={{position: 'absolute', right: '120px', top: '45px', height: '30px'}}/>
            </dev>
            <br /><br/>
            <span>
                <b>{t("currentAddr")}</b> {currentaccount}
                <br/>
                <b>{t("roleAcc")}</b> {showActorRole(actors, currentaccount, t)}
            </span>

            <br/><br/><br/>

            <h6>{t("addProd")}</h6>
            <form onSubmit={handlerSubmitProduct}>
                <div className="form-floating mb-3">
                    <input type="text" className="form-control" id="floatingName" onChange={handlerChangeNameProduct} placeholder="Product Name" required/>
                    <label for="floatingName">{t("nameProd")}</label>
                </div>
                <div className='form mb-3'> 
                    <label>{t("ingr")}</label>
                    <Select 
                        isMulti
                        name="colors"
                        options={name_ingr}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        autoFocus={true} 
                        onChange={handlerChangeIngrProduct}
                    />
                </div>  
                <div className="form mb-3">
                    {/* <input className="form-control " type="file" id="formFile" onChange={(e)=>setFile(e.target.files)} multiple required/> */}
                    <input className="form-control " type="file" id="formFile" onChange={(e)=>setFile(e.target.files)} multiple/>
                </div>
                <div className='mb-3 disabled' style={{textAlign: 'center'}} title={(showActorRole(actors, currentaccount, t) !== t("own")) ? t("limitOwn") : ""}>
                    <button className="me-1 btn btn-success"  disabled={(showActorRole(actors, currentaccount, t).includes(t("own"))) ? false : true} onSubmit={handlerSubmitProduct} style={{width: '10cm', fontWeight: 'bold'}}>{t("addButton")}</button>
                </div> 
            </form>

            <br/><br/>
            
            <h6>{t("ordProd")}</h6>
            <table className="table table-sm">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">{t("nameProd")}</th>
                        <th scope="col">{t("ingr")}</th>
                        <th scope="col">{t("description")}</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(product).map(function (key) {
                        if(product[key].active === true){
                            let x=0;
                            return (
                                <tr key={key}>
                                    <td>{Number(product[key].id)}</td>
                                    <td>{product[key].name}</td>
                                    <td>{showNames(productIngr[key], product)}</td>
                                    <td>
                                    {Object.values(hashProd[parseInt(product[key].id)-1]).map(function (hash) {
                                        x++;
                                        return(
                                            <div>
                                                File {x}: <a href={'https://gateway.pinata.cloud/ipfs/'+ hash} target='_blank' rel="noreferrer">{t("read")}</a>
                                            </div>
                                        )
                                    })}
                                    </td>
                                    <td>
                                        <button value={key} className="btn btn-danger btn-sm" onClick={handleDeleteProduct}>{t("delete")}</button>
                                    </td>
                                </tr>
                            )
                        }
                    })}
                </tbody>
            </table>
        </div>
    )
}

function showNames(ingr, prod){
    let output=[];
    if(ingr.length !== 0) {
        for (let i = 0; i < ingr.length; i++) {
            if (i === ingr.length-1) {
                output.push(prod[Number(ingr[i])-1].name)
            } else {
                output.push(prod[Number(ingr[i])-1].name+" - ")
            }
        }
    }
    else output.push("//");
    return output;
}

function showActorRole(arr1, addr, t) {
    let cond=false;
    var possibility = [t("sup"), t("man"), t("dis"), t("ret")];
    var output=[];
    for (let index = 0; index < Object.keys(arr1).length; index++) {
        if (arr1[index].addr === addr){
            if (cond) output.push( " / ");
            output.push(possibility[arr1[index].role]);
            cond=true;
        }
    }
    if (addr === process.env.REACT_APP_OWNER_ADDRESS) { 
        output.push(t("own"))
    } else if (output.length === 0){
        output.push(t("notReg"));
    }
    return output;
}

export default AddProd
