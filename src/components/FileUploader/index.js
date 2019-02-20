'use strict';
import React from 'react';
import { Icon, message, Modal, Spin, Upload } from 'antd';
import PropTypes from 'prop-types';
import request from '@/utils/request';
import { FormattedMessage,formatMessage } from 'umi/locale';
import { joinPath } from '@/utils';
import styles from './index.less';

class FileUploader extends React.Component {
    state = {
        uploading : false,
    };

    static propTypes = {
        scene : PropTypes.number.isRequired,
        allowFileExt : PropTypes.array,
        maxFileSize : PropTypes.number,
    };

    static defaultProps = {
        name : 'file_data',
        onError : (err) =>{message.error(err.message);},
    };

    beforeUpload = (file) =>{
        const { onChange = () =>{}, responseInValue, allowFileExt, maxFileSize, name, scene, data = { file_id : scene }, onError } = this.props;
        if (maxFileSize && file.size/1024 > maxFileSize) {
            onError(new Error(formatMessage({ id : 'Validator.fileSize' },{ size : (maxFileSize/1024)+'M' })));
            return false;
        }
        if(allowFileExt){
            const {name=''} = file;
            const extName = name.substring(name.lastIndexOf('.')+1,name.length);
            const isAllowFile = allowFileExt.find(item=>item.toLowerCase()===extName);
            if (!isAllowFile) {
                onError(new Error(formatMessage({
                    id : 'Validator.limitFileTypes',
                },{ types : allowFileExt.join(',') })));
                return false;
            }
        }
        this.setState({ uploading : true });
        const params = {
            ...data,
            [name] : file,
        };
        const formData = new FormData();
        Object.keys(params).map(key =>{
            formData.append(key, params[key]);
        });
        request.post('basis/file/upload', formData).then(res =>{
            onChange(responseInValue ? res.data[0] : res.data[0].file_key);
            return res.data[0];
        }, err =>{
            onError(err);
        }).finally(() =>{
            this.setState({ uploading : false });
        });
        return false;
    };


    render(){
        const { children, beforeUpload, ...restProps } = this.props;
        const { uploading } = this.state;
        return <Upload {...restProps} onChange={beforeUpload} beforeUpload={this.beforeUpload}>
            {uploading?<Spin/>:children}
        </Upload>;
    }
}

FileUploader.Scene = {
    LZ_QR_LOGO : 1,
    LZ_QR_BLANK : 2,
    BUSINESS_LICENSE : 3,
    LOGO : 4,
    CONTACT_IDCARD : 5,
    ACQUIRE_PRODUCTS_ICON: 6,
    SERVICE_CONTRACT : 7,
};

FileUploader.Image = class extends React.Component {
    state = {
        preview : this.props.initPreview,
        previewVisible: false,
    };
    static propTypes = {
        scene : PropTypes.number.isRequired,
        allowFileExt : PropTypes.array,
        maxFileSize : PropTypes.number,
    };
    static defaultProps={
        allowFileExt:['jpg','jpeg','png']
    };
    isImage=(path)=>{
        if(!path)return false;
        const ext = path.substr(path.lastIndexOf('.')+1).toLowerCase();
        return ['jpg','jpeg','png','bmp','ico'].indexOf(ext) !== -1;
    };
    handleChange = (resp) =>{
        const url = joinPath(resp.access_url, resp.file_key);
        this.setState({ preview : url} );
        this.props.onChange(resp.file_key,url);
    };
    handleRemove=()=>{
        this.setState({ preview : '' });
        this.props.onChange('');
    };
    handlePreview = (file) => {
        if(!this.isImage(file.url)){
            window.open(file.url)
        }else {
            this.setState({
                previewVisible: true,
            });
        }
    };
    closePreview=()=>{
        this.setState({
            previewVisible: false,
        });
    };
    render(){
        // const { value } = this.props;
        const {preview,previewVisible} = this.state;
        const fileList = [];
        if(preview)fileList.push({
            uid: '0',
            status: 'done',
            url: preview,
        });
        return <div>
            <FileUploader
                {...this.props}
                responseInValue
                onChange={this.handleChange}
                onRemove={this.handleRemove}
                onPreview={this.handlePreview}
                fileList={fileList}
                listType="picture-card"
            >
                {preview ? null:
                    <div>
                        <Icon type="plus" style={{ fontSize : 32, color : '#999' }}/>
                        <div className="ant-upload-text"><FormattedMessage id={'Common.message.upload'}/></div>
                    </div>
                }
            </FileUploader>
            <div className={styles.fileTypeTip}>
                <FormattedMessage id={'Component.fileUploader.allowTypes'} values={{types:this.props.allowFileExt.join(',')}}/>
            </div>
            <Modal visible={previewVisible} footer={null} onCancel={this.closePreview}>
                <img style={{ width: '100%' }} src={preview} />
            </Modal>
        </div>;
    }
};

FileUploader.Native = class extends React.PureComponent {
    static propTypes = {
        onChange:PropTypes.func
    };

    onChange = (e) =>{
        this.props.onChange(e.target.files[0]);
    };

    emit = () =>{
        this.refs.file.click();
    };


    render(){
        const {value} = this.props
        return (
            <span className={'ant-upload ant-upload-select-picture-card'} onClick={this.emit}>
                <span className={'ant-upload'}>
                    <input onChange={this.onChange} ref={'file'} style={{ display : 'none' }} type={'file'}/>
                    {this.props.children || (
                        <div>
                            <Icon type="plus" style={{fontSize:32}}/>
                            <div className={'ant-upload-text'}>
                                {
                                 value ? value.name : <FormattedMessage id={'Common.message.upload'}/>
                                }
                            </div>
                        </div>
                    )}
                </span>
            </span>
        );
    }
};

export default FileUploader;
