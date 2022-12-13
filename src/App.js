import React, { useState, useEffect } from "react";
import useWebSocket from "react-use-websocket";

const webSocketURL = "wss://ws.binaryws.com/websockets/v3?app_id=1089";

const App = () => {
  const [payoutCurrencies, setPayoutCurrencies] = useState([]);
  const [exchangeRates, setExchangeRates] = useState({});
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [baseValue, setBaseValue] = useState(0);
  const { lastJsonMessage, sendJsonMessage, readyState } = useWebSocket(webSocketURL, {
    onOpen: (openEvent) => {
      console.info("Socket Open");
    },
    shouldReconnect: (closeEvent) => true,
    onError: (errorEvent) => console.error(errorEvent),
  });

  useEffect(() => {
    // console.info("Here");
    if (!lastJsonMessage) return;
    // console.info("***",data);
    if (lastJsonMessage.msg_type === "exchange_rates") {
      setExchangeRates(lastJsonMessage.exchange_rates.rates);
      // console.info("****", lastJsonMessage.exchange_rates.rates);
      return;
    }
    setPayoutCurrencies(lastJsonMessage.payout_currencies);
    // console.info("***", lastJsonMessage.payout_currencies);
  }, [lastJsonMessage]);


  useEffect(() => {

    if (readyState !== 1) return;
    if (!payoutCurrencies || !payoutCurrencies.length) {
      sendJsonMessage({
        "payout_currencies": 1
      });
    }

    sendJsonMessage({
      "exchange_rates": 1,
      "base_currency": baseCurrency
    });
    // console.log("Data Requested");
  }, [baseCurrency, readyState]);

  useEffect(() => {
    console.log(payoutCurrencies, exchangeRates);
  }, [payoutCurrencies, exchangeRates]);

  return (
    <section className="container mx-auto p-5">
      <h1 className="text-primary text-center mb-5">Payout Currency Converter</h1>
      <form>
        <fieldset>
          <legend className="text-center text-white">
            Enter Amounts and Currencies
          </legend>
          <div className="mb-3 row w-25 mx-auto g-2">
            <input type="number" className="form-control" min="0" value={baseValue} onChange={(event) => setBaseValue(event.target.value)} />
            <select className="form-select" onChange={(event) => setBaseCurrency(event.target.value)}>
              {
                payoutCurrencies.map((currency, index) => <option key={index} value={currency}>{currency}</option>)
              }
            </select>
          </div>
        </fieldset>
      </form>
      <table className="table">
  <thead>
    <tr>
      <th scope="col">Currency</th>
      <th scope="col">Value</th>
    </tr>
  </thead>
  <tbody>
    {Object.entries(exchangeRates).map(([currency, factor], index) => {
      let value = baseValue * factor;
      if(["USD", "AUD", "GBP"].includes(currency)) {
        value = value.toFixed(2);
      }
      return <tr key={index}>
        <td>{currency}</td>
        <td>{value}</td>
      </tr>;
    })}
  </tbody>
</table>
    </section>
  );
};

export default App;
