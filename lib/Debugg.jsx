// import { Container } from './styles';

function Debugg({ data }) {
    return (
        <pre className="max-w-sm overflow-x-auto text-xs">
            {JSON.stringify(data, null, 2)}
        </pre>
    );
}

export default Debugg;
