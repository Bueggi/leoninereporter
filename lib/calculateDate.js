import moment from "moment"

const calculateDate = (date) => {
    return moment(date).fromNow()
}

export default calculateDate