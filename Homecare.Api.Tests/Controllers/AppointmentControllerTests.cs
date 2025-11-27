using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HomeCareApp.Controllers;
using HomeCareApp.DTOs;
using HomeCareApp.Models;
using HomeCareApp.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Homecare.Api.Tests.Controllers
{
    public class AppointmentControllerTests
    {
        private readonly Mock<IAppointmentRepository> _appointmentRepoMock;
        private readonly Mock<INotificationRepository> _notificationRepoMock;
        private readonly Mock<ILogger<AppointmentController>> _loggerMock;
        private readonly AppointmentController _controller;

        public AppointmentControllerTests()
        {
            _appointmentRepoMock = new Mock<IAppointmentRepository>();
            _notificationRepoMock = new Mock<INotificationRepository>();
            _loggerMock = new Mock<ILogger<AppointmentController>>();

            _controller = new AppointmentController(
                _appointmentRepoMock.Object,
                _notificationRepoMock.Object,
                _loggerMock.Object
            );
        }

        /// <summary>
        /// Helper to create a valid Appointment object with all required properties set.
        /// </summary>
        private Appointment CreateTestAppointment(int id = 1, string subject = "Test")
        {
            return new Appointment
            {
                AppointmentId = id,
                Subject = subject,
                Date = DateTime.Now,
                Patient = new Patient
                {
                    UserId = "patient-user-id",
                    FullName = "Test Patient",
                    User = null!,
                    Appointments = new List<Appointment>()
                },
                Employee = new Employee
                {
                    UserId = "employee-user-id",
                    FullName = "Test Employee",
                    User = null!,
                    Appointments = new List<Appointment>()
                }
            };
        }

        // ------------------- GET ALL -------------------

        [Fact]
        public async Task GetAppointments_ReturnsOk_WhenAppointmentsExist()
        {
            // Arrange
            var appointments = new List<Appointment>
            {
                CreateTestAppointment(1, "Checkup"),
                CreateTestAppointment(2, "Follow-up")
            };

            _appointmentRepoMock
                .Setup(r => r.GetAll())
                .ReturnsAsync(appointments);

            // Act
            var result = await _controller.GetAppointments();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var dtos = Assert.IsAssignableFrom<IEnumerable<AppointmentDto>>(okResult.Value);
            Assert.Equal(2, dtos.Count());
        }

        [Fact]
        public async Task GetAppointments_ReturnsNotFound_WhenRepositoryReturnsNull()
        {
            // Arrange
            _appointmentRepoMock
                .Setup(r => r.GetAll())
                .ReturnsAsync((IEnumerable<Appointment>?)null);

            // Act
            var result = await _controller.GetAppointments();

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Equal("Appointment list not found", notFoundResult.Value);
        }

        // ------------------- GET BY ID -------------------

        [Fact]
        public async Task GetAppointmentById_ReturnsOk_WhenAppointmentExists()
        {
            // Arrange
            var appointment = CreateTestAppointment(1, "Checkup");

            _appointmentRepoMock
                .Setup(r => r.GetAppointmentById(1))
                .ReturnsAsync(appointment);

            // Act
            var result = await _controller.GetAppointmentById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var dto = Assert.IsType<AppointmentDto>(okResult.Value);
            Assert.Equal(1, dto.AppointmentId);
            Assert.Equal("Checkup", dto.Subject);
        }

        [Fact]
        public async Task GetAppointmentById_ReturnsNotFound_WhenAppointmentDoesNotExist()
        {
            // Arrange
            _appointmentRepoMock
                .Setup(r => r.GetAppointmentById(1))
                .ReturnsAsync((Appointment?)null);

            // Act
            var result = await _controller.GetAppointmentById(1);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Equal("Appointment with ID 1 not found", notFoundResult.Value);
        }

        // ------------------- CREATE -------------------

        [Fact]
        public async Task Create_ReturnsBadRequest_WhenDtoIsNull()
        {
            // Act
            var result = await _controller.Create(null!);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Appointment cannot be null", badRequest.Value);
        }

        [Fact]
        public async Task Create_ReturnsCreated_WhenRepositoryReturnsTrue()
        {
            // Arrange
            var dto = new AppointmentDto
            {
                AppointmentId = 1,
                Subject = "New Appointment",
                Date = DateTime.Now
            };

            var createdAppointment = CreateTestAppointment(1, "New Appointment");

            _appointmentRepoMock
                .Setup(r => r.Create(It.IsAny<Appointment>()))
                .ReturnsAsync(true);

            _appointmentRepoMock
                .Setup(r => r.GetAppointmentById(It.IsAny<int>()))
                .ReturnsAsync(createdAppointment);

            // Act
            var result = await _controller.Create(dto);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            var returnedAppointment = Assert.IsType<Appointment>(createdResult.Value);
            Assert.Equal("New Appointment", returnedAppointment.Subject);
        }

        [Fact]
        public async Task Create_ReturnsInternalServerError_WhenRepositoryReturnsFalse()
        {
            // Arrange
            var dto = new AppointmentDto
            {
                AppointmentId = 1,
                Subject = "New Appointment"
            };

            _appointmentRepoMock
                .Setup(r => r.Create(It.IsAny<Appointment>()))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.Create(dto);

            // Assert
            var objectResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, objectResult.StatusCode);
            Assert.Equal("Internal server error", objectResult.Value);
        }

        // ------------------- UPDATE -------------------

        [Fact]
        public async Task Update_ReturnsBadRequest_WhenDtoIsNull()
        {
            // Act
            var result = await _controller.Update(1, null!);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Appointment data cannot be null", badRequest.Value);
        }

        [Fact]
        public async Task Update_ReturnsNotFound_WhenAppointmentDoesNotExist()
        {
            // Arrange
            _appointmentRepoMock
                .Setup(r => r.GetAppointmentById(1))
                .ReturnsAsync((Appointment?)null);

            var dto = new AppointmentDto
            {
                AppointmentId = 1,
                Subject = "Updated Subject"
            };

            // Act
            var result = await _controller.Update(1, dto);

            // Assert
            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("Appointment not found", notFound.Value);
        }

        [Fact]
        public async Task Update_ReturnsOk_WhenUpdateSuccessful()
        {
            // Arrange
            var existingAppointment = CreateTestAppointment(1, "Old Subject");

            var dto = new AppointmentDto
            {
                AppointmentId = 1,
                Subject = "Updated Subject",
                Date = DateTime.Now
            };

            _appointmentRepoMock
                .Setup(r => r.GetAppointmentById(1))
                .ReturnsAsync(existingAppointment);

            _appointmentRepoMock
                .Setup(r => r.Update(It.IsAny<Appointment>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Update(1, dto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var updatedAppointment = Assert.IsType<Appointment>(okResult.Value);
            Assert.Equal("Updated Subject", updatedAppointment.Subject);
        }

        // ------------------- DELETE -------------------

        [Fact]
        public async Task Delete_ReturnsNotFound_WhenAppointmentDoesNotExist()
        {
            // Arrange
            _appointmentRepoMock
                .Setup(r => r.GetAppointmentById(1))
                .ReturnsAsync((Appointment?)null);

            // Act
            var result = await _controller.Delete(1);

            // Assert
            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("Appointment not found", notFound.Value);
        }

        [Fact]
        public async Task Delete_ReturnsNoContent_WhenDeleteSuccessful()
        {
            // Arrange
            var appointment = CreateTestAppointment(1, "To delete");

            _appointmentRepoMock
                .Setup(r => r.GetAppointmentById(1))
                .ReturnsAsync(appointment);

            _appointmentRepoMock
                .Setup(r => r.Delete(1))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Delete(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task Delete_ReturnsBadRequest_WhenDeleteFails()
        {
            // Arrange
            var appointment = CreateTestAppointment(1, "To delete");

            _appointmentRepoMock
                .Setup(r => r.GetAppointmentById(1))
                .ReturnsAsync(appointment);

            _appointmentRepoMock
                .Setup(r => r.Delete(1))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.Delete(1);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Appointment deletion failed", badRequest.Value);
        }
    }
}
