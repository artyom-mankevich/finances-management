import {PieChart} from "react-native-gifted-charts/src/PieChart";

export default function DebtChart(props) {
    return (
        <PieChart
            innerRadius={92}
            donut={true}
            data={props.data}
            innerCircleColor={'#eeeeee'}
        />
    );
}