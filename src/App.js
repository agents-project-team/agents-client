import 'bootstrap/dist/css/bootstrap.min.css';
import {useEffect, useState} from "react";
import {getAgentsByContainers, getOrderToStatusMapping, getSortedAndParsedEvents} from "./services/state.parser";

const containersNames = ["BackupMachines", "Main-Container", "DeadMachines", "BackupAssemblers"]

function App() {
    const [agentsByContainers, setAgentsByContainer] = useState({});
    const [response, setResponse] = useState([]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetch('http://localhost:8083/state')
                .then(res => res.json())
                .then(jsonState => {
                    setResponse(jsonState);
                    return getAgentsByContainers(jsonState)
                })
                .then(agents => setAgentsByContainer(agents))
                .catch(console.log);
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    const getTableRows = () => {
        let rows = [];
        const max = Math.max(...Object.values(agentsByContainers).map(a => a.length));
        for(let i = 0; i < max; i++) {
            const cells = [];
            for(const container of containersNames) {
                const element = agentsByContainers[container][i];
                const cell = <td key={i+element+container}>{element}</td>;
                cells.push(cell);
            }
            const row = <tr key={i}>{cells}</tr>;
            rows.push(row);
        }

        return rows;
    };

    const getTableHeaders = () => {
        const headers = [];
        for(const container of containersNames) {
            const header =  <th key={container} scope="col">{container}</th>;
            headers.push(header);
        }

        return headers;
    }

    const getOrders = () => {
        const ordersJsx = [];
        const orders = getOrderToStatusMapping(response);

        for(const order of Object.keys(orders)) {
            const orderId = <td >{order}</td>;
            const orderStatus = <td>{orders[order]}</td>;
            const orderLine = <tr key={order}>
                {[orderId, orderStatus]}
            </tr>
            ordersJsx.push(orderLine);
        }

        return ordersJsx;
    }

  return (
      <>
          <div className="card m-3">
              <div className="card-header">
                  <h3>Order statuses</h3>
              </div>
              <div className="card-body">
                  <table className={"table"}>
                      <thead>
                          <tr>
                              <th>Order ID</th>
                              <th>Status</th>
                          </tr>
                      </thead>
                      <tbody>
                      {
                          getOrders()
                      }
                      </tbody>
                  </table>
              </div>
          </div>
          <div className={"card m-3"}>
              <div className="card-header">
                  <h3>System state console</h3>
              </div>
              <div className="card-body">
                  <table className="table">
                      <thead>
                      <tr>
                          {
                              getTableHeaders()
                          }
                      </tr>
                      </thead>
                      <tbody>
                      {
                          getTableRows()
                      }
                      </tbody>
                  </table>
              </div>
          </div>
          <div className={"card m-3"}>
              <div className="card-header">
                  <h3>System logs</h3>
              </div>
              <div className="card-body">
                <table className="table m-3">
                    <tbody>
                    {
                        getSortedAndParsedEvents(response).reverse().map((event, i) => {
                            return (<tr key={i}><td>{event}</td></tr>)
                            }
                        )
                    }
                    </tbody>
                </table>
              </div>
          </div>
      </>
  );
}

export default App;
