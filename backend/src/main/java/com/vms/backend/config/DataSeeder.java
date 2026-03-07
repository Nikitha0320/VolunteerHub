package com.vms.backend.config;

import com.vms.backend.entity.Event;
import com.vms.backend.entity.Role;
import com.vms.backend.entity.User;
import com.vms.backend.entity.VolunteerRole;
import com.vms.backend.repository.EventRepository;
import com.vms.backend.repository.UserRepository;
import com.vms.backend.repository.VolunteerRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final String DEFAULT_PASSWORD = "Password@123";
        private static final String ADMIN_DEFAULT_PASSWORD = "admin123";

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final VolunteerRoleRepository volunteerRoleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
                seedAdmins();
        List<User> organizers = seedOrganizers();
        seedVolunteers();
        seedEventsAndRoles(organizers);
    }

        private void seedAdmins() {
                User admin = userRepository.findByEmail("admin@gmail.com")
                                .orElseGet(() -> User.builder()
                                                .name("System Admin")
                                                .email("admin@gmail.com")
                                                .role(Role.ADMIN)
                                                .build());

                boolean changed = false;
                if (!Role.ADMIN.equals(admin.getRole())) {
                        admin.setRole(Role.ADMIN);
                        changed = true;
                }

                if (admin.getPassword() == null || !passwordEncoder.matches(ADMIN_DEFAULT_PASSWORD, admin.getPassword())) {
                        admin.setPassword(passwordEncoder.encode(ADMIN_DEFAULT_PASSWORD));
                        changed = true;
                }

                if (admin.getName() == null || admin.getName().isBlank()) {
                        admin.setName("System Admin");
                        changed = true;
                }

                if (changed || admin.getId() == null) {
                        userRepository.save(admin);
                }
        }

    private List<User> seedOrganizers() {
        List<User> organizers = new ArrayList<>();
        organizers.add(createUserIfMissing("Aarav Reddy", "aarav.reddy@volunteerhub.org", Role.ORGANIZER, "9876501001", 29, "Madhapur, Hyderabad"));
        organizers.add(createUserIfMissing("Saanvi Rao", "saanvi.rao@volunteerhub.org", Role.ORGANIZER, "9876501002", 31, "Hitech City, Hyderabad"));
        organizers.add(createUserIfMissing("Vikram Teja", "vikram.teja@volunteerhub.org", Role.ORGANIZER, "9876501003", 30, "Gachibowli, Hyderabad"));
        organizers.add(createUserIfMissing("Ishita Naidu", "ishita.naidu@volunteerhub.org", Role.ORGANIZER, "9876501004", 28, "Kukatpally, Hyderabad"));
        organizers.add(createUserIfMissing("Rahul Varma", "rahul.varma@volunteerhub.org", Role.ORGANIZER, "9876501005", 33, "LB Nagar, Hyderabad"));
        return organizers;
    }

    private void seedVolunteers() {
                ensureUserPassword("Siri", "siri@gmail.com", Role.VOLUNTEER);
        createUserIfMissing("Nikhil Kumar", "nikhil.kumar@volunteerhub.org", Role.VOLUNTEER, "9876602001", 21, "Madhapur, Hyderabad");
        createUserIfMissing("Priya Sharma", "priya.sharma@volunteerhub.org", Role.VOLUNTEER, "9876602002", 23, "Kukatpally, Hyderabad");
        createUserIfMissing("Sai Kiran", "sai.kiran@volunteerhub.org", Role.VOLUNTEER, "9876602003", 24, "Gachibowli, Hyderabad");
        createUserIfMissing("Ananya Reddy", "ananya.reddy@volunteerhub.org", Role.VOLUNTEER, "9876602004", 22, "LB Nagar, Hyderabad");
        createUserIfMissing("Rohan Mehta", "rohan.mehta@volunteerhub.org", Role.VOLUNTEER, "9876602005", 25, "Hitech City, Hyderabad");
        createUserIfMissing("Meera Joshi", "meera.joshi@volunteerhub.org", Role.VOLUNTEER, "9876602006", 20, "Miyapur, Hyderabad");
        createUserIfMissing("Arjun Nair", "arjun.nair@volunteerhub.org", Role.VOLUNTEER, "9876602007", 26, "Shamshabad, Hyderabad");
        createUserIfMissing("Sneha Patil", "sneha.patil@volunteerhub.org", Role.VOLUNTEER, "9876602008", 22, "Banjara Hills, Hyderabad");
        createUserIfMissing("Karthik Goud", "karthik.goud@volunteerhub.org", Role.VOLUNTEER, "9876602009", 27, "Ameerpet, Hyderabad");
        createUserIfMissing("Divya Menon", "divya.menon@volunteerhub.org", Role.VOLUNTEER, "9876602010", 24, "Secunderabad, Hyderabad");
    }

        private void ensureUserPassword(String name, String email, Role role) {
                User user = userRepository.findByEmail(email)
                                .orElseGet(() -> User.builder()
                                                .name(name)
                                                .email(email)
                                                .role(role)
                                                .build());

                boolean changed = false;
                if (!role.equals(user.getRole())) {
                        user.setRole(role);
                        changed = true;
                }

                if (user.getName() == null || user.getName().isBlank()) {
                        user.setName(name);
                        changed = true;
                }

                if (user.getPassword() == null || !passwordEncoder.matches(DEFAULT_PASSWORD, user.getPassword())) {
                        user.setPassword(passwordEncoder.encode(DEFAULT_PASSWORD));
                        changed = true;
                }

                if (changed || user.getId() == null) {
                        userRepository.save(user);
                }
        }

    private void seedEventsAndRoles(List<User> organizers) {
        if (organizers.isEmpty()) {
            return;
        }

        Map<String, Event> existingEventsByTitle = new HashMap<>();
        for (Event event : eventRepository.findAll()) {
            existingEventsByTitle.putIfAbsent(event.getTitle(), event);
        }

        List<EventSeed> eventSeeds = buildEventSeeds();
        int organizerIndex = 0;

        for (EventSeed seed : eventSeeds) {
            Event event = existingEventsByTitle.get(seed.title());
            if (event == null) {
                User organizer = organizers.get(organizerIndex % organizers.size());
                organizerIndex++;

                event = eventRepository.save(Event.builder()
                        .title(seed.title())
                        .description(seed.description())
                        .location(seed.location())
                        .eventDate(seed.date())
                        .eventTime(seed.time())
                        .maxVolunteers(seed.maxVolunteers())
                        .organizer(organizer)
                        .cancelled(false)
                        .build());

                existingEventsByTitle.put(seed.title(), event);
            }

            if (volunteerRoleRepository.findByEventId(event.getId()).isEmpty()) {
                for (RoleSeed roleSeed : seed.roles()) {
                    volunteerRoleRepository.save(VolunteerRole.builder()
                            .event(event)
                            .roleName(roleSeed.roleName())
                            .roleDescription(roleSeed.roleDescription())
                            .volunteersRequired(roleSeed.volunteersRequired())
                            .build());
                }
            }
        }
    }

    private User createUserIfMissing(String name, String email, Role role, String phoneNumber, Integer age, String address) {
        return userRepository.findByEmail(email).orElseGet(() -> userRepository.save(User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(DEFAULT_PASSWORD))
                .role(role)
                .phoneNumber(phoneNumber)
                .age(age)
                .address(address)
                .build()));
    }

    private List<EventSeed> buildEventSeeds() {
        return List.of(
                new EventSeed(
                        "KBR Park Morning Cleanup Drive",
                        "Volunteers will clean walking tracks, collect plastic waste, and support waste segregation awareness.",
                        "KBR Park, Hyderabad",
                        LocalDate.of(2026, 4, 5),
                        LocalTime.of(6, 30),
                        20,
                        List.of(
                                new RoleSeed("Cleanup Lead", "Coordinate cleanup zones and safety briefing.", 6),
                                new RoleSeed("Waste Segregation Volunteer", "Collect and separate dry/wet waste at collection points.", 10)
                        )
                ),
                new EventSeed(
                        "Charminar Community Food Distribution",
                        "Prepare and distribute meal packets to local families in need around the Charminar area.",
                        "Charminar Area, Hyderabad",
                        LocalDate.of(2026, 4, 12),
                        LocalTime.of(8, 0),
                        30,
                        List.of(
                                new RoleSeed("Food Packing Volunteer", "Pack meal kits and label distribution batches.", 12),
                                new RoleSeed("Queue Management Volunteer", "Guide beneficiaries and maintain orderly distribution lines.", 10)
                        )
                ),
                new EventSeed(
                        "Shilparamam Tree Plantation Initiative",
                        "Plant native saplings and install protective guards in designated green zones.",
                        "Shilparamam, Hitech City",
                        LocalDate.of(2026, 4, 19),
                        LocalTime.of(7, 0),
                        25,
                        List.of(
                                new RoleSeed("Pit Preparation Team", "Prepare soil pits and compost mix before planting.", 8),
                                new RoleSeed("Sapling Planting Team", "Plant saplings and water them after placement.", 12)
                        )
                ),
                new EventSeed(
                        "Durgam Cheruvu Water Distribution Drive",
                        "Set up hydration points for visitors and workers during peak summer hours.",
                        "Durgam Cheruvu Park, Madhapur",
                        LocalDate.of(2026, 4, 26),
                        LocalTime.of(9, 30),
                        18,
                        List.of(
                                new RoleSeed("Booth Setup Volunteer", "Arrange water cans, cups, and signage at service counters.", 6),
                                new RoleSeed("Distribution Volunteer", "Serve water and monitor refill requirements.", 8)
                        )
                ),
                new EventSeed(
                        "Gachibowli Blood Donation Camp Support",
                        "Assist medical staff with donor flow and pre-donation guidance.",
                        "Gachibowli Sports Complex",
                        LocalDate.of(2026, 5, 3),
                        LocalTime.of(10, 0),
                        22,
                        List.of(
                                new RoleSeed("Registration Desk Volunteer", "Capture donor details and issue token numbers.", 8),
                                new RoleSeed("Donor Support Volunteer", "Help donors move between screening, donation, and rest zones.", 10)
                        )
                ),
                new EventSeed(
                        "Miyapur Lake Environmental Awareness Campaign",
                        "Conduct awareness activities on lake conservation and plastic reduction.",
                        "Miyapur Lake Park",
                        LocalDate.of(2026, 5, 10),
                        LocalTime.of(7, 30),
                        20,
                        List.of(
                                new RoleSeed("Awareness Talk Volunteer", "Engage visitors with short talks on eco-friendly habits.", 6),
                                new RoleSeed("Pamphlet Distribution Volunteer", "Distribute informational handouts and guide interactions.", 10)
                        )
                ),
                new EventSeed(
                        "Kukatpally Public Library Reorganization",
                        "Reorganize shelves, sort books by category, and update tracking labels.",
                        "Kukatpally Housing Board Park",
                        LocalDate.of(2026, 5, 17),
                        LocalTime.of(9, 0),
                        16,
                        List.of(
                                new RoleSeed("Book Sorting Volunteer", "Sort books by subject and age category.", 6),
                                new RoleSeed("Catalog Update Volunteer", "Assist with tagging and shelf index updates.", 6)
                        )
                ),
                new EventSeed(
                        "LB Nagar Government School Painting Day",
                        "Refresh classroom and corridor walls to improve school learning spaces.",
                        "LB Nagar Community Park",
                        LocalDate.of(2026, 5, 24),
                        LocalTime.of(8, 30),
                        24,
                        List.of(
                                new RoleSeed("Surface Prep Team", "Clean walls, tape edges, and prepare paint areas.", 8),
                                new RoleSeed("Painting Team", "Paint walls and complete finishing touches.", 12)
                        )
                ),
                new EventSeed(
                        "Shamshabad Old Age Home Visit Program",
                        "Spend time with seniors through activities and distribute care kits.",
                        "Shamshabad Public Park",
                        LocalDate.of(2026, 5, 31),
                        LocalTime.of(10, 30),
                        18,
                        List.of(
                                new RoleSeed("Activity Coordination Volunteer", "Run games, reading sessions, and conversations with residents.", 6),
                                new RoleSeed("Care Kit Distribution Volunteer", "Prepare and distribute essentials to residents.", 8)
                        )
                ),
                new EventSeed(
                        "Osman Sagar Medical Camp Assistance",
                        "Support a free health check-up camp with registration and patient guidance.",
                        "Osman Sagar (Gandipet) Lake Area",
                        LocalDate.of(2026, 6, 7),
                        LocalTime.of(9, 0),
                        28,
                        List.of(
                                new RoleSeed("Patient Registration Volunteer", "Register patients and maintain token flow.", 10),
                                new RoleSeed("Guidance and Queue Volunteer", "Guide patients to consultation desks and manage waiting lines.", 12)
                        )
                )
        );
    }

    private record RoleSeed(String roleName, String roleDescription, Integer volunteersRequired) {
    }

    private record EventSeed(
            String title,
            String description,
            String location,
            LocalDate date,
            LocalTime time,
            Integer maxVolunteers,
            List<RoleSeed> roles
    ) {
    }
}