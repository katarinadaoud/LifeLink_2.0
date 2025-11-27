using HomeCareApp.Models;

namespace HomeCareApp.Repositories.Interfaces;

    /*This interface defines all basic CRUD operations AppointmentRepository should have. 
    It includes functions for getting, creating, updating, and deleting appointments. 
    All methods are asynchronous.*/
    public interface IAppointmentRepository
    {
        Task<IEnumerable<Appointment>> GetAll(); //<IEnumerable> when you want to get all appointments
        Task<Appointment?> GetAppointmentById(int id); //when you want to get a specific appointment

        //bools to indicate success or failure
        Task<bool> Create(Appointment appointment);
        Task<bool> Update(Appointment appointment);
        Task<bool> Delete(int id);
        
    }


    

