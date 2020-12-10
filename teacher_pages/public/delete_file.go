type Person struct {
	ID string
	Name string
}

type Address struct {
	ID string
	PersonID string
	Street string
	City string
	Zip string
}
// so you are not allowed to create an instance of the interface. But you are allowed to create a variable of an interface type and this variable can be assigned with a concrete type value that has the methods the interface requires
type DB interface { 											//Forcing code encapsulation , Allowing for more versatile code
	AddressForPerson(personID string) *Address 										// method in interface with return type
	AddressesForPeople(personIDs [ ] string) [ ]*Address
}
-----------------------------------------------------------------------------------------------------------------------------------------------
// Option A
function getAllAddressesA( db DB, people []*Person) []*Address { // passes variable db of an interface type and  pointer to struct Person
	var addresses []*Address 			// declares a variable of type []*Address
	for _, person := range people {   // people is pointer to struct Person
	
		address := db.AddressForPerson(person.ID)  // uses DB method in DB interface , type is a pointer
		addresses = append(addresses,address) // appends address for every person
	}
	return addresses
}

// Option B
function getAllAddressesB( db DB, people []*Person) []*Address {
	var personIDs[] string   // declares a variable of type [] string
	for _, person := range people {
		personIDs = append(personIDs, person.ID) // appends ID of every person
	}
	return db.AddressesForPeople(personIDs) // returns using DB interface method
}

// Option C
function getAllAddressesC( db DB, people []*Person) []*Address {

	x := fX(people)                       // takes list of people, send to helper func
	y := db.AddressesForPeople(x)            // returns using DB interface method
	return y
}
func fX(people []*Person) []string { // helper function

	var t[] string
	for _, person := range people {

		t = append(t, person.ID) // appends ID of every person
	} return t
}
