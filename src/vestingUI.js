import React, { useState, useEffect } from "react";
import {Dropdown, DropdownButton, Table, Button} from 'react-bootstrap'
import { Line } from 'react-chartjs-2'
import moment from 'moment'
// import Web3 from 'web3';
import TokenVesting from './TokenVesting.json';

const Loading = () => {
  return (
    <div className='spinner'>
      <img src="/loading.gif" alt="loading" />
    </div>
    );
}

const TableRow = ({ title, children }) => {
  return (
    <tr>
      <th>{ title }</th>
      <td>
        { children }
      </td>
    </tr>
  )
}

const VestingUI = ({ address }) => {
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [claimedAmount, setClaimedAmount] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [startTimeDisplay, setStartTimeDisplay] = useState('');
  const [endTime, setEndTime] = useState(0);
  const [endTimeDisplay, setEndTimeDisplay] = useState('');
  const [cliffTime, setCliffTime] = useState(0);
  const [cliffTimeDisplay, setCliffTimeDisplay] = useState('');

  useEffect(() => {
    getData()
  });

  async function getData() {
    const Web3 = require('web3');
    const web3 = new Web3(Web3.givenProvider);
    const token = new web3.eth.Contract(TokenVesting.abi, '0xC470970Bd42B6cA046AF6d79C70135dCBcfce05a');

    const schedule = await token.methods.schedules('0x32C960AEc22ff061Fa3c0520aa4B83a9D96925f3', 0).call();

    setTotalAmount(schedule.totalAmount);
    setClaimedAmount(schedule.claimedAmount);

    setStartTime(schedule.startTime);
    setEndTime(schedule.endTime);
    setCliffTime(1630000000);

    setStartTimeDisplay(moment(startTime * 1000).format("D MMMM YYYY, h:mm a"));
    setEndTimeDisplay(moment(endTime * 1000).format("D MMMM YYYY, h:mm a"));
    setCliffTimeDisplay(moment(cliffTime * 1000).format("D MMMM YYYY, h:mm a"));

    setLoading(false);
  }

  async function claimTokens() {
    const Web3 = require('web3');
    const web3 = new Web3(Web3.givenProvider);
    const token = new web3.eth.Contract(TokenVesting.abi, '0xC470970Bd42B6cA046AF6d79C70135dCBcfce05a');

    token.methods.claim(0);
  }

  const chartData = () => {
    return {
      datasets: [
        {
          data: getPoints(),
          borderColor: '#000',
          pointBackgroundColor: '#000',
          pointRadius: 10
        }
      ],
    }
  }

  const getPoints = () => {
    const current = new Date() / 1000

    const points = [ getPointAtTime(startTime) ]

    if (cliffTime < current) {
      points.push(getPointAtTime(cliffTime))
    }

    if (startTime < current && current < endTime) {
      points.push(getPointAtTime(current))
    }

    if (cliffTime > current) {
      points.push(getPointAtTime(cliffTime))
    }

    points.push(getPointAtTime(endTime))

    return points
  }

  const getPointAtTime = (time) => {
    return {
      x: moment(time * 1000).format('MM/DD/YYYY HH:mm'),
      y: displayAmount(totalAmount, 2) * (time - startTime) / (endTime - startTime)
    }
  }

  const chartOptions = () => {
    return {
      legend: {
        display: false
      },
      scales: {
        xAxes: [
          {
            type: "time",
            time: {
              format: 'MM/DD/YYYY HH:mm',
              tooltipFormat: 'll HH:mm'
            },
            scaleLabel: {
              display: true,
              labelString: 'Date'
            }
          },
        ],
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: 'Amount'
            }
          }
        ]
      },
    }
  }

  const displayAmount = (amount, decimals) => {
    amount = amount / (10 ** decimals)
    return Math.round(amount * 10000) / 10000
  }

  return (
    <>
      {loading ? <Loading /> : null}

      <DropdownButton title="Select Vesting Contract ">
        <Dropdown.Item href="/0x90D93f5A390bFDBC401f92e916197ee17470a447">0x90D93f5A390bFDBC401f92e916197ee17470a447</Dropdown.Item>
        <Dropdown.Item href="/0x9c4a4204b79dd291d6b6571c5be8bbcd0622f050">0x9c4a4204b79dd291d6b6571c5be8bbcd0622f050</Dropdown.Item>
      </DropdownButton>

      <Table striped bordered>
        <tbody>

          <TableRow title="Vesting address">
            <a href={ `https://etherscan.io/address/${address}` } target="_blank" rel="noreferrer">
              { address }
            </a>
          </TableRow>

          <TableRow title="Total amount">
            { totalAmount }
          </TableRow>

          <TableRow title="Claimed amount">
            { claimedAmount }
          </TableRow>

          <TableRow title="Start time">
            { startTimeDisplay }
          </TableRow>

          <TableRow title="End time">
            { endTimeDisplay }
          </TableRow>

          <TableRow title="Cliff time">
            { cliffTimeDisplay }
          </TableRow>

        </tbody>
      </Table>

      <Line data={ chartData } options={ chartOptions() } />

      <Button variant="primary" size="lg" onClick={() => claimTokens()}>
        Claim Vested Tokens
      </Button>{' '}

    </>
  );
};

export default VestingUI;
