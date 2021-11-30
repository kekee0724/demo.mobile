import React from "react";

import {Form, Input } from "antd-mobile";


export function renderInputItem(label: string, value: string, i: number) {
    return (
        <Form.Item key={i} name="contactName" label={label}>
          <Input type="text" disabled value={value}/>
        </Form.Item>
    );
}

export function cycleItems(items: any) {
    return items && items.map((item: any, i: number) => this.renderInputItem(item.label, item.value, i));
}

