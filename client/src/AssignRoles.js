import React, { useState, useEffect } from 'react';
import Web3 from "web3";
import Select from 'react-select';
import SupplyChainABI from "./artifacts/SupplyChain.json"
import { useNavigate } from "react-router-dom"
import axios from "axios";
import { useTranslation } from "react-i18next";
import { IT, GB } from 'country-flag-icons/react/3x2'

function AssignRoles() {

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
    const [actorName, setActorName] = useState();
    const [actorPlace, setActorPlace] = useState();
    const [actorAddress, setActorAddress] = useState();
    const [actorRole, setActorRole] = useState();
    const [actors, setActors] = useState();
    const [file, setFile] = useState("");

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
            const actorCtr = await supplychain.methods.actorCtr().call();
            const act = {};
            for (var i = 0; i < actorCtr; i++) {
                act[i] = await supplychain.methods.Actors(i+1).call();
            }
            setActors(act);
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
    const handlerChangeAddressACT = (event) => {
        setActorAddress(event.target.value);
    }
    const handlerChangePlaceACT = (event) => {
        setActorPlace(event.target.value);
    }
    const handlerChangeNameACT = (event) => {
        setActorName(event.target.value);
    }
    const handlerChangeRoleACT = (event) => {
        const role=[]
        for (let i = 0; i < event.length; i++) {
            role.push(parseInt(event[i].value));
        }
        setActorRole(role);
    }
    const handlerSubmitACT = async (event) => {
        event.preventDefault();
        try {
            const fileData = new FormData();
            fileData.append("file", file);
            const responseData = await axios({
                method: "post",
                url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                data: fileData,
                headers: {
                    'pinata_api_key': process.env.REACT_APP_PINATA_API_KEY,
                    'pinata_secret_api_key': process.env.REACT_APP_PINATA_SECRET_KEY,
                    "Content-Type": "multipart/form-data"
                }
            })
            const fileUrl = "https://gateway.pinata.cloud/ipfs/" + responseData.data.IpfsHash;
            var reciept = await supplyChain.methods.addActor(actorAddress, actorRole, actorName, actorPlace, responseData.data.IpfsHash).send({ from: currentaccount});
            if (reciept) {
                loadBlockchaindata()
            };
        } catch (err) {
            alert(t("errAlert"))
        }
    }

    return (
        <div className='main'>
            <dev className='container'>
                <button onClick={redirect_to_home} className="ms-4 btn btn-danger" style={{ position: 'absolute', left: '35px', top: '40px' }}>HOME</button>
                <h1 className='title'>{t("manageActor")}</h1>
                <GB title="English" type='button' onClick={() => handleChangeLanguage("en")}  style={{position: 'absolute', right: '55px', top: '45px', height: '30px'}}/>
                <IT title="Italiano" type='button' onClick={() => handleChangeLanguage("it")}  style={{position: 'absolute', right: '120px', top: '45px', height: '30px'}}/>
            </dev>
            <br/><br/>
            <span>
                <b>{t("currentAddr")}</b> {currentaccount}
                <br/>
                <b>{t("roleAcc")}</b> {showActorRole(actors, currentaccount, t)}
            </span>
            <br/><br/><br/>

            <h4>{t("createAct")}</h4>
            <br/>
            <form onSubmit={handlerSubmitACT} >
                <div className="form-floating mb-3">
                    <input type="text" className="form-control" id="floatingEth" onChange={handlerChangeAddressACT} placeholder="Add Ethereum Address" required/>
                    <label for="floatingEth">{t("ethAddr")}</label>
                </div>
                <div className="form-floating mb-3">
                    <input type="text" className="form-control" id="floatingName" onChange={handlerChangeNameACT} placeholder="Add Name Actor" required/>
                    <label for="floatingName">{t("actName")}</label>
                </div>
                <div className="form-floating mb-3">
                    <input type="text" className="form-control" id="floatingPlace" onChange={handlerChangePlaceACT} placeholder="Add Location" required/>
                    <label for="floatingPlace">{t("actLocation")}</label>
                </div>
                <div className="form mb-3">
                    <label>{t("selectRole")}</label>
                    <Select 
                        isMulti
                        name="colors"
                        options={[{value: 0, label: t("sup")},{value: 1, label: t("man")},{value: 2, label: t("dis")},{value: 3, label: t("ret")}]}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        autoFocus={true} 
                        onChange={handlerChangeRoleACT}
                    />
                </div>
                <div className="form mb-3">
                    <input className="form-control " type="file" id="formFile" onChange={(e)=>setFile(e.target.files[0])} required/>
                </div>
                <div className='mb-3 disabled' style={{textAlign: 'center'}} title={(showActorRole(actors, currentaccount, t) != t("own")) ? t("limitOwn") : ""}>
                    <button className="btn btn-warning"  disabled={(showActorRole(actors, currentaccount, t).includes(t("own"))) ? false : true} onSubmit={handlerSubmitACT} style={{width: '10cm', fontWeight: 'bold'}}>{t("registerButton")}</button>
                </div>  
            </form>

            <br/><br/>


            <h4>{t("listAct")}</h4>
            <br/>
            <table className="pb-5 mb-5 table table-sm">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">{t("actName")}</th>
                        <th scope="col">{t("actLocation")}</th>
                        <th scope="col">{t("role")}</th>
                        <th scope="col">{t("description")}</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(actors).map(function (key) {
                        const name_roles = [];
                        name_roles.push(t("sup"), t("man"), t("dis"), t("ret"))
                        return (
                            <tr key={key}>
                                <td>{actors[key].addr}</td>
                                <td>{actors[key].name}</td>
                                <td>{actors[key].place}</td>
                                <td>{name_roles[actors[key].role]}</td>
                                <td><a href={'https://gateway.pinata.cloud/ipfs/'+ actors[key].hashFileActor} target='_blank' rel="noreferrer">{t("showButton")} {t("description")}</a></td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
function showActorRole(arr1, addr, t) {
    let cond=false;
    var possibility = [t("sup"), t("man"), t("dis"), t("ret")];
    var output=[];
    for (let index = 0; index < Object.keys(arr1).length; index++) {
        if (arr1[index].addr == addr){
            if (cond) output.push( " / ");
            output.push(possibility[arr1[index].role]);
            cond=true;
        }
    }
    if (addr === process.env.REACT_APP_OWNER_ADDRESS) {
        output.push(t("own"))
    } else if (output.length == 0){
        output.push(t("notReg"));
    }
    return output;
}

export default AssignRoles
