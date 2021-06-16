const containersNames = ["BackupMachines", "Main-Container", "DeadMachines", "BackupAssemblers"]

const getAgentsLocalNames = (events) => {
    const allNames =  events
        .filter(e => e.who !== null)
        .map(e => e.who.localName);

    return new Set(allNames);
}

const getEventsByContainer = (events) => {
    const eventsByContainer = {};
    for(const container of containersNames) {
        eventsByContainer[container] = events.filter(event => event.where === container);
    }

    return eventsByContainer;
}

const getSortedAndParsedEvents = (events) => {
    const sorted = events.sort((a,b,) => new Date(a.when) - new Date(b.when));
    const parsed = sorted.map(event => `${event.event} : ${event.who?.localName} at ${event.where}`);
    return parsed;
}

const getOrderToStatusMapping = (events) => {
    const orderToStatus = {};
    const orderEvents = events
        .filter(event => event.event.includes("ORDER_"))
        .sort((a,b) => new Date(b.when) - new Date(a.when))
        .reverse();
    const orderIds = new Set(orderEvents.map(oe => oe.additional_data));
    for(const orderId of orderIds) {
        orderToStatus[orderId] = orderEvents.find(o => o.additional_data === orderId).event === "ORDER_CREATED" ? "CREATED" : "COMPLETED";
    }

    return orderToStatus;
}

const getAgentsByContainers = (events) => {
    const agentsByContainers = {
        "BackupMachines": [],
        "Main-Container": [],
        "DeadMachines": [],
        "BackupAssemblers": []
    };
    const agents = getAgentsLocalNames(events);
    for(const agent of agents) {
        const agentEvents = events
            .filter(e => e.who?.localName === agent)
            .sort((a,b) => new Date(a.when) - new Date(b.when))
            .reverse();
        const agentContainer = agentEvents[0].where;

        agentsByContainers[agentContainer].push(agent);
    }

    return agentsByContainers;
}

module.exports = {getEventsByContainer, getSortedAndParsedEvents, getAgentsByContainers, getOrderToStatusMapping};