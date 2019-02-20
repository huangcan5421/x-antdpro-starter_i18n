"use strict";
import React from 'react';
import {Button, Drawer} from 'antd';
import {formatMessage} from "umi/locale";
import './index.less';
import PropTypes from "prop-types";
import classnames from 'classnames';

export default class DrawerConfirm extends React.Component {
    static propTypes={
        onCancel:PropTypes.func,
        onOk:PropTypes.func,
        confirmLoading: PropTypes.bool,
        cancelText:PropTypes.any,
        okText:PropTypes.any,
        okType:PropTypes.string,
        okButtonProps:PropTypes.object,
        cancelButtonProps:PropTypes.object
    };
    render() {
        const {children,onCancel,onOk,
            confirmLoading=false,
            className,
            cancelText=formatMessage({id:"Common.button.cancel"}),
            okText=formatMessage({id:"Common.button.ok"}),
            okType='primary',okButtonProps,cancelButtonProps,
            ...restProps} = this.props;
        return <Drawer {...restProps}
                       className={classnames(className,'comp-DrawerConfirm')}
                       onClose={onCancel}>
            <div className={'comp-DrawerConfirm_content'}>{children}</div>
            <div className={'comp-DrawerConfirm_footer'}>
                <Button {...cancelButtonProps} onClick={onCancel}>{cancelText}</Button>
                <Button type={okType}
                        loading={confirmLoading}
                        {...okButtonProps}
                        onClick={onOk}>{okText}</Button>
            </div>
        </Drawer>
    }
}