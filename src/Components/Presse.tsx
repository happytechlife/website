import * as React from 'react';
import { List, Card } from '@material-ui/core'
import { IHappyTechStore, IPresse } from '../models';
import './Startups.css';
import * as md from './../Markdowns/presse.md';
import { Markdown } from '../Utils/Pages/Markdown';
import { cloudinaryTransform } from '../Utils/Cloudinary';

interface IProps {
    store: IHappyTechStore
}


export class PresseGrid extends React.Component<IProps, {}> {
    public render() {
        const { store } = this.props;
        if (!store) {
            return null;
        }
        const { presse } = store;
        return <React.Fragment>
            <Markdown md={md}>
                <List style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>{presse.map(PresseCard)}</List >
            </Markdown>
        </React.Fragment>
    }
}


function PresseCard(presse: IPresse) {
    const logo = cloudinaryTransform(presse.logo, 'w_300,h_168,c_pad,f_png');
    return <Card key={presse.rowId} style={{ width: 320, margin: 8 }}>
        {logo && <img src={logo} />}
    </Card>;
}