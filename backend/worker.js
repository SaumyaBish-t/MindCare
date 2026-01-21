import './queues/reminderQueue.js';

process.on('inhandledRejection',(e)=>{
    console.error('Worker rejection:',e);
});