import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, ShoppingCart, MapPin, Clock, Calendar, Download, Share2, CalendarPlus, Camera, Map, Route, Plus, X, Edit2 } from "lucide-react";
import { motion } from "framer-motion";

interface Guide {
  id: number;
  title: string;
  image: string;
  description: string;
}

interface DetectedPlace {
  name: string;
  days: number;
}

interface DayActivity {
  time: string;
  activity: string;
}

interface ItineraryDay {
  day: number;
  place: string;
  activities: DayActivity[];
}

export default function TravelMVP() {
  const [cart, setCart] = useState<Guide[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [detectedPlaces, setDetectedPlaces] = useState<DetectedPlace[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDayPlanning, setShowDayPlanning] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState<ItineraryDay[]>([]);
  const [showItinerary, setShowItinerary] = useState(false);
  const cartIconRef = useRef(null);

  const guides: Guide[] = [
    {
      id: 1,
      title: "Guida India",
      image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      description: "Un viaggio spirituale e culturale attraverso le meraviglie dell'India: dal Taj Mahal ai templi di Varanasi."
    },
    {
      id: 2,
      title: "Guida Thailandia",
      image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      description: "Scopri le spiagge tropicali, i mercati fluttuanti e i templi dorati in un itinerario indimenticabile."
    },
    {
      id: 3,
      title: "Guida Perù",
      image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      description: "Un'avventura sulle Ande: Cusco, Machu Picchu e la Valle Sacra, tra storia e paesaggi mozzafiato."
    }
  ];

  const placeActivities: Record<string, DayActivity[][]> = {
    'Roma': [
      [
        { time: '09:00', activity: 'Visita al Colosseo e Foro Romano' },
        { time: '13:00', activity: 'Pranzo in una trattoria locale' },
        { time: '15:00', activity: 'Passeggiata per il centro storico' },
        { time: '18:00', activity: 'Aperitivo con vista sui Fori' }
      ],
      [
        { time: '09:00', activity: 'Musei Vaticani e Cappella Sistina' },
        { time: '13:00', activity: 'Pranzo vicino al Vaticano' },
        { time: '15:00', activity: 'Basilica di San Pietro' },
        { time: '18:00', activity: 'Aperitivo a Trastevere' }
      ],
      [
        { time: '09:00', activity: 'Fontana di Trevi e Pantheon' },
        { time: '12:00', activity: 'Villa Borghese e Galleria' },
        { time: '15:00', activity: 'Shopping via del Corso' },
        { time: '19:00', activity: 'Cena con vista sui Fori Imperiali' }
      ]
    ],
    'Parigi': [
      [
        { time: '09:00', activity: 'Torre Eiffel al mattino' },
        { time: '11:00', activity: 'Crociera sulla Senna' },
        { time: '14:00', activity: 'Pranzo in bistrot' },
        { time: '16:00', activity: 'Quartiere di Montmartre' }
      ],
      [
        { time: '09:00', activity: 'Museo del Louvre' },
        { time: '13:00', activity: 'Giardini delle Tuileries' },
        { time: '15:00', activity: 'Champs-Élysées shopping' },
        { time: '18:00', activity: 'Aperitivo parigino' }
      ],
      [
        { time: '09:00', activity: 'Sacré-Cœur e Montmartre' },
        { time: '12:00', activity: 'Quartiere Latino' },
        { time: '15:00', activity: 'Île de la Cité' },
        { time: '19:00', activity: 'Cena in un bistrot tradizionale' }
      ]
    ],
    'default': [
      [
        { time: '09:00', activity: 'Esplorazione del centro storico' },
        { time: '12:00', activity: 'Visita ai principali monumenti' },
        { time: '14:00', activity: 'Pranzo con specialità locali' },
        { time: '16:00', activity: 'Tour guidato della città' }
      ],
      [
        { time: '09:00', activity: 'Musei e gallerie d\'arte' },
        { time: '12:00', activity: 'Parchi e giardini' },
        { time: '15:00', activity: 'Shopping nei mercati locali' },
        { time: '18:00', activity: 'Esperienza culinaria locale' }
      ],
      [
        { time: '09:00', activity: 'Escursioni nei dintorni' },
        { time: '13:00', activity: 'Pranzo panoramico' },
        { time: '15:00', activity: 'Attività culturali' },
        { time: '19:00', activity: 'Vita notturna e intrattenimento' }
      ]
    ]
  };

  const callVisionAPI = async (base64Image: string): Promise<string | null> => {
    const apiKey = import.meta.env.VITE_GOOGLE_VISION_API_KEY || "AIzaSyBjCbFv7HdNFK15va0cPPy6my4SnQTLZNQ";
    const endpoint = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
    
    const body = {
      requests: [
        {
          image: { content: base64Image.split(",")[1] },
          features: [{ type: "LANDMARK_DETECTION", maxResults: 1 }]
        }
      ]
    };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (data.error) {
        console.error("Errore Vision API:", data.error.message);
        return null;
      }

      const landmark = data.responses?.[0]?.landmarkAnnotations?.[0]?.description;
      return landmark;
    } catch (error) {
      console.error("Errore Vision API:", error);
      return null;
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsAnalyzing(true);
    const previewsArray: string[] = [];
    const detectedPlacesArray: string[] = [];

    for (const file of files) {
      const reader = new FileReader();
      await new Promise<void>((resolve) => {
        reader.onloadend = async () => {
          if (reader.result) {
            previewsArray.push(reader.result as string);
            const place = await callVisionAPI(reader.result as string);
            if (place) detectedPlacesArray.push(place);
          }
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }

    setPreviews(previewsArray);
    
    // Remove duplicates and create DetectedPlace objects with default 3 days
    const uniquePlaces = Array.from(new Set(detectedPlacesArray)).filter(Boolean);
    let placesWithDays: DetectedPlace[] = uniquePlaces.map(place => ({
      name: place,
      days: 3
    }));
    
    // Se non vengono rilevati luoghi, aggiungi luoghi di esempio per permettere all'utente di iniziare
    if (placesWithDays.length === 0) {
      placesWithDays = [
        { name: "Destinazione 1", days: 3 },
        { name: "Destinazione 2", days: 2 }
      ];
    }
    
    setDetectedPlaces(placesWithDays);
    setIsAnalyzing(false);
    setShowDayPlanning(true);
  };

  const updatePlaceDays = (placeName: string, days: number) => {
    setDetectedPlaces(prev => 
      prev.map(place => 
        place.name === placeName ? { ...place, days } : place
      )
    );
  };

  const updatePlaceName = (oldName: string, newName: string) => {
    setDetectedPlaces(prev => 
      prev.map(place => 
        place.name === oldName ? { ...place, name: newName } : place
      )
    );
  };

  const addNewPlace = () => {
    setDetectedPlaces(prev => [...prev, { name: `Nuova Destinazione ${prev.length + 1}`, days: 2 }]);
  };

  const removePlace = (placeName: string) => {
    setDetectedPlaces(prev => prev.filter(place => place.name !== placeName));
  };

  const generateDetailedItinerary = () => {
    const itinerary: ItineraryDay[] = [];
    let currentDay = 1;

    detectedPlaces.forEach(place => {
      const activities = placeActivities[place.name] || placeActivities['default'];
      
      for (let day = 0; day < place.days; day++) {
        const dayActivities = activities[day % activities.length];
        
        itinerary.push({
          day: currentDay,
          place: place.name,
          activities: dayActivities
        });
        
        currentDay++;
      }
    });

    setGeneratedItinerary(itinerary);
    setShowItinerary(true);
  };

  const addToCart = (item: Guide) => {
    setCart(prev => [...prev, item]);
  };

  const handlePurchase = (item: Guide) => {
    addToCart(item);
    alert(`Stai per acquistare: ${item.title}. Procedi al pagamento...`);
  };

  const getTotalDays = () => {
    return detectedPlaces.reduce((total, place) => total + place.days, 0);
  };

  return (
    <div className="min-h-screen bg-[hsl(48,77%,94%)] text-[hsl(89,45%,16%)] font-sans relative">
      {/* Cart Icon */}
      <div className="absolute top-5 right-5 z-50 flex items-center bg-white rounded-full px-3 py-2 shadow-lg" ref={cartIconRef}>
        <ShoppingCart className="w-6 h-6 mr-2 text-[hsl(89,45%,16%)]" />
        <span className="text-sm font-semibold">{cart.length}</span>
      </div>

      {/* Hero Section */}
      <section
        className="bg-cover bg-center h-[80vh] flex items-center justify-center relative"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')"
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 text-center text-white p-10 rounded-2xl bg-black bg-opacity-30 backdrop-blur-sm">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Esplora il mondo con me
          </h1>
          <p className="text-lg md:text-xl">
            Scopri itinerari, storie e guide di viaggio
          </p>
        </div>
      </section>

      {/* Chi Sono */}
      <section className="py-12 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Chi Sono</h2>
        <p className="text-lg leading-relaxed">
          Sono una fotografa e storyteller che viaggia per il mondo per raccontare storie autentiche. Ho camminato tra le rovine del Perù, attraversato deserti marocchini e condiviso tè con monaci in Giappone. Ogni viaggio è per me un'occasione per osservare, ascoltare e narrare. Se ami i viaggi lenti, profondi e pieni di emozioni, sei nel posto giusto.
        </p>
      </section>

      {/* Shop */}
      <section className="py-12 px-6 bg-[hsl(42,78%,91%)]">
        <h2 className="text-3xl font-bold mb-6 text-center">Shop di Viaggio</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {guides.map((guide) => (
            <Card key={guide.id} className="rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <img
                src={guide.image}
                alt={guide.title}
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-4">
                <h3 className="font-semibold text-xl mb-2">{guide.title}</h3>
                <p className="text-sm mb-3">{guide.description}</p>
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-[hsl(89,45%,16%)] text-white hover:bg-opacity-90" 
                    onClick={() => addToCart(guide)}
                  >
                    Aggiungi al carrello
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handlePurchase(guide)}
                  >
                    Acquista ora
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Enhanced AI Itinerary Section */}
      <section className="py-12 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Crea il tuo Itinerario Personalizzato
        </h2>
        
        {/* Photo Upload Area */}
        <div className="border-4 border-dashed border-[hsl(34,58%,62%)] rounded-2xl p-10 text-center mb-8">
          <UploadCloud className="mx-auto mb-4 w-12 h-12 text-[hsl(34,58%,62%)]" />
          <p className="mb-4 text-lg">Carica più foto del tuo viaggio</p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="mb-4 block mx-auto file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[hsl(34,58%,62%)] file:text-white hover:file:bg-opacity-80"
          />
          
          {/* Photo Previews */}
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            {previews.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Anteprima ${index + 1}`}
                className="max-h-40 rounded-xl shadow-md"
              />
            ))}
          </div>
          
          {/* Loading Indicator */}
          {isAnalyzing && (
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-[hsl(34,58%,62%)]">
              <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              Analizzando le foto...
            </div>
          )}
        </div>

        {/* Day Planning Section */}
        {showDayPlanning && (
          <motion.div
            className="fade-in mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold mb-6 text-center">Pianifica i tuoi giorni</h3>
            <Card className="bg-white rounded-2xl shadow-lg">
              <CardContent className="p-6">
                <p className="text-center text-gray-600 mb-4">
                  Specifica quanti giorni vuoi trascorrere in ogni destinazione rilevata:
                </p>
                <div className="space-y-4">
                  {detectedPlaces.map((place, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3 flex-1">
                        <MapPin className="w-5 h-5 text-[hsl(34,58%,62%)]" />
                        <Input
                          type="text"
                          value={place.name}
                          onChange={(e) => updatePlaceName(place.name, e.target.value)}
                          className="font-semibold bg-transparent border-none p-0 focus:bg-white focus:border focus:p-2 transition-all"
                          placeholder="Nome destinazione"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">Giorni:</label>
                        <Input
                          type="number"
                          min="1"
                          max="30"
                          value={place.days}
                          onChange={(e) => updatePlaceDays(place.name, parseInt(e.target.value) || 1)}
                          className="day-input w-20 focus:scale-105 focus:shadow-lg focus:shadow-[hsl(34,58%,62%)]/30"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePlace(place.name)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-3 mt-4">
                  <Button
                    onClick={addNewPlace}
                    variant="outline"
                    className="flex-1 border-[hsl(34,58%,62%)] text-[hsl(34,58%,62%)] hover:bg-[hsl(34,58%,62%)] hover:text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi Destinazione
                  </Button>
                </div>
                
                <Button
                  onClick={generateDetailedItinerary}
                  className="w-full mt-6 bg-[hsl(89,45%,16%)] text-white hover:bg-opacity-90 py-3 text-lg font-semibold"
                  disabled={detectedPlaces.length === 0}
                >
                  <Route className="w-5 h-5 mr-2" />
                  Genera Itinerario Dettagliato
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Generated Itinerary */}
        {showItinerary && (
          <motion.div
            className="fade-in"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-[hsl(42,78%,91%)] to-[hsl(48,77%,94%)] rounded-2xl shadow-lg">
              <CardContent className="p-8">
                <h4 className="font-bold text-2xl mb-6 text-center flex items-center justify-center">
                  <Map className="w-6 h-6 mr-3 text-[hsl(34,58%,62%)]" />
                  Il tuo Itinerario Personalizzato
                </h4>
                
                <div className="space-y-6">
                  {generatedItinerary.map((dayPlan, index) => (
                    <div key={index} className="itinerary-day pl-4 py-3 mb-3 bg-white rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="bg-[hsl(34,58%,62%)] text-white px-3 py-1 rounded-full text-sm font-semibold mr-3">
                          Giorno {dayPlan.day}
                        </span>
                        <span className="font-semibold">{dayPlan.place}</span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        {dayPlan.activities.map((activity, actIndex) => (
                          <div key={actIndex} className="flex items-start">
                            <Clock className="w-4 h-4 text-[hsl(34,58%,62%)] mr-2 mt-0.5 flex-shrink-0" />
                            <span className="font-medium mr-2">{activity.time}</span>
                            <span>{activity.activity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="bg-[hsl(89,45%,16%)] text-white p-4 rounded-lg mt-6">
                  <h6 className="font-bold mb-2">Riepilogo del Viaggio</h6>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <strong>Durata totale:</strong>&nbsp;{getTotalDays()} giorni
                    </div>
                    <div className="flex items-center">
                      <Map className="w-4 h-4 mr-2" />
                      <strong>Destinazioni:</strong>&nbsp;{detectedPlaces.length}
                    </div>
                    <div className="flex items-center">
                      <Camera className="w-4 h-4 mr-2" />
                      <strong>Foto analizzate:</strong>&nbsp;{previews.length}
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                    <Download className="w-4 h-4 mr-2" />
                    Scarica PDF
                  </Button>
                  <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                    <Share2 className="w-4 h-4 mr-2" />
                    Condividi Itinerario
                  </Button>
                  <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                    <CalendarPlus className="w-4 h-4 mr-2" />
                    Aggiungi al Calendario
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </section>

      {/* Instagram Section */}
      <footer className="bg-[hsl(89,45%,16%)] text-[hsl(48,77%,94%)] py-8 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h3 className="text-2xl font-bold mb-4">Seguimi sui Social</h3>
          <p className="text-lg mb-6">Scopri le mie avventure quotidiane e i dietro le quinte dei miei viaggi</p>
          <div className="flex justify-center space-x-6">
            <a
              href="https://www.instagram.com/ivanborrino"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-pink-600 px-4 py-2 rounded-full hover:bg-pink-700 transition-colors"
            >
              <span>@ivanborrino</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
